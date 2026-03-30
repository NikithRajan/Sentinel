import sys
import io
import traceback

class Capture:
    def __init__(self):
        self.output = io.StringIO()
    def write(self, s):
        self.output.write(s)
    def flush(self):
        pass

old_stdout = sys.stdout
sys.stdout = Capture()

try:
    from evacuation import test_graph
except BaseException as e:
    sys.stdout.write(f"Error/Exit: {e}\n")
    
with open("real_output.txt", "w") as f:
    f.write(sys.stdout.output.getvalue())

sys.stdout = old_stdout
print("Finished wrapping")
