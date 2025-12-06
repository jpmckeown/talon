import subprocess
import sys


def run_script(script_name):    
    result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
    
    if result.stdout:
        print(result.stdout)
    
    if result.stderr:
        print(f"Errors from {script_name}:", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
    
    if result.returncode != 0:
        print(f"\nError: {script_name} failed by {result.returncode}")
        sys.exit(1)
    
    print(f"\n✓ {script_name} completed successfully")


def main():
    run_script("write_deck_resize.py")
    # run_script("cards_maker_56x78.py")
    run_script("add_back_design.py")
    run_script("add_alternate_back.py")    


if __name__ == "__main__":
    main()
