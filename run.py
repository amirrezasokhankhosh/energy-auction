import os
import time
import subprocess

if __name__ == "__main__":
    cwd = os.path.dirname(__file__)
    
    # Step 1: Bring up the network
    os.chdir(os.path.join(cwd, "test-network"))
    os.system("sh ./start.sh")

    # Step 2: Bring up the express application
    os.chdir(os.path.join(cwd, "express-application"))
    with open("../logs/app.txt", "w") as f:
        subprocess.Popen(
            ["node", f"./app.js"],
            stdout=f,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            preexec_fn=os.setsid
        )
    time.sleep(1)

    # Step 3: Initialize resources
    os.chdir(os.path.join(cwd, "test-network"))
    os.system("sh ./req.sh")