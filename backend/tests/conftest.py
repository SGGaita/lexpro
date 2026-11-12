import os
import sys

# Make `app` importable and keep tests independent of any local .env file.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(os.path.dirname(os.path.abspath(__file__)))
