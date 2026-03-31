import subprocess
import threading
import sys
import os
import signal
import platform

# --- Configuration ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# ANSI Colors for terminal prefixes
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

SERVICES = [
    {
        "name": "BROKER",
        "dir": "SENTINEL_MQQT_Module/backend-bridge",
        "command": ["npm", "start"], 
        "color": Colors.CYAN,
        "is_python": False
    },
    {
        "name": "MIL-DASH",
        "dir": "SENTINEL_MQQT_Module/military-dashboard",
        "command": ["npm", "run", "dev", "--", "--port", "5173"], 
        "color": Colors.GREEN,
        "is_python": False
    },
    {
        "name": "DISPATCHER",
        "dir": "SENTINEL_MQQT_Module/backend-dispatcher",
        "command": ["evac_dispatcher.py"], 
        "color": Colors.YELLOW,
        "is_python": True 
    },
    {
        "name": "YOLO",
        "dir": "SENTINEL_YOLO",
        "command": ["-u", "yolo_mqtt_bridge.py"],
        "color": Colors.RED,
        "is_python": True
    }
]

processes = []

def find_python_executable(service_dir):
    """
    Search for a python virtual environment (.venv, venv) in the service directory.
    If found, return the path to the python executable.
    Otherwise, fallback to sys.executable.
    """
    venv_names = ['.venv', 'venv']
    is_windows = platform.system() == 'Windows'
    for venv_name in venv_names:
        venv_path = os.path.join(service_dir, venv_name)
        if os.path.isdir(venv_path):
            if is_windows:
                python_exe = os.path.join(venv_path, "Scripts", "python.exe")
            else:
                python_exe = os.path.join(venv_path, "bin", "python")
            if os.path.isfile(python_exe):
                return python_exe
    return sys.executable

def stream_output(pipe, prefix, color):
    """
    Reads lines from a pipe (stdout/stderr) and prints them with a color-coded prefix.
    """
    try:
        for line in iter(pipe.readline, ''):
            if not line:
                break
            # Print with prefix
            sys.stdout.write(f"{color}{Colors.BOLD}[{prefix}]{Colors.RESET} {line}")
            sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f"{color}{Colors.BOLD}[{prefix}]{Colors.RESET} Error reading stream: {e}\n")
    finally:
        pipe.close()

def start_service(service):
    abs_dir = os.path.join(ROOT_DIR, service["dir"])
    color = service["color"]
    name = service["name"]
    command = service["command"].copy()

    # Pre-check: Does directory exist?
    if not os.path.isdir(abs_dir):
        print(f"{color}{Colors.BOLD}[{name}] WARNING: Directory '{abs_dir}' not found. Skipping.{Colors.RESET}")
        return

    # Check for npm modules to ensure dependencies
    if not service.get("is_python"):
        package_json = os.path.join(abs_dir, "package.json")
        node_modules = os.path.join(abs_dir, "node_modules")
        if os.path.isfile(package_json) and not os.path.isdir(node_modules):
            print(f"{color}{Colors.BOLD}[{name}] Running 'npm install'...{Colors.RESET}")
            subprocess.run(["npm", "install"], cwd=abs_dir, shell=platform.system() == 'Windows')

    # Build the final command
    if service.get("is_python"):
        python_exe = find_python_executable(abs_dir)
        print(f"{color}{Colors.BOLD}[{name}] Using Python -> {python_exe}{Colors.RESET}")
        command.insert(0, python_exe)
    
    # Handle 'npm' command on Windows
    use_shell = False
    if platform.system() == 'Windows' and command[0] == 'npm':
        use_shell = True

    try:
        p = subprocess.Popen(
            command,
            cwd=abs_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.PIPE,
            text=True,
            bufsize=1, # Line buffering
            shell=use_shell
        )
        processes.append((name, p))

        # Start a thread to stream output
        thread = threading.Thread(target=stream_output, args=(p.stdout, name, color), daemon=True)
        thread.start()

    except Exception as e:
         print(f"{color}{Colors.BOLD}[{name}] Failed to start: {e}{Colors.RESET}")

def shutdown_all(signum=None, frame=None):
    """
    Gracefully terminates all child processes when the main script shuts down.
    """
    print(f"\n{Colors.BOLD}Initiating shutdown sequence for {len(processes)} processes...{Colors.RESET}")
    for name, p in processes:
        if p.poll() is None:  # Process is still running
            print(f"Terminating [{name}]...")
            try:
                if platform.system() == 'Windows':
                    # Windows doesn't easily pass SIGTERM via Python nicely without tasks;
                    p.kill()
                else:
                    p.send_signal(signal.SIGTERM)
            except Exception as e:
                print(f"Failed to terminate [{name}]: {e}")
    print(f"{Colors.BOLD}All services shut down.{Colors.RESET}")
    sys.exit(0)

if __name__ == "__main__":
    # Hook Ctrl+C (SIGINT) and termination (SIGTERM)
    signal.signal(signal.SIGINT, shutdown_all)
    signal.signal(signal.SIGTERM, shutdown_all)

    print(f"{Colors.BOLD}Starting Sentinel Orchestrator...{Colors.RESET}")

    for svc in SERVICES:
        start_service(svc)

    print(f"{Colors.BOLD}All services launched. Press Ctrl+C to terminate everything. {Colors.RESET}")

    # Keep main thread alive waiting for interrupt
    try:
        for name, p in processes:
             p.wait()
    except KeyboardInterrupt:
        shutdown_all()
