import os
import time
from tqdm import tqdm
import random
import requests
import subprocess


def run_network(ext=""):
    cwd = os.path.dirname(__file__)

    try:
        requests.get("http://localhost:3000/exit/")
    except:
        print("Express app stopped.")

    # Step 1: Bring up the network
    os.chdir(os.path.join(cwd, "test-network"))
    os.system(f"sh ./start{ext}.sh")

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


def create_resources(num_resources):
    for i in tqdm(range(num_resources)):
        requests.post("http://localhost:3000/api/resource/",
                      json={
                          "id": f"resource_{i}",
                          "volume": random.randint(10, 100),
                          "price": random.randint(100, 500),
                          "type": random.choice(["generation", "storage"])
                      })


def create_bids(num_resources, num_bids):
    for i in tqdm(range(num_resources)):
        for j in range(num_bids):
            requests.post("http://localhost:3000/api/bid/",
                          json={
                              "id": f"bid_{j}",
                              "resource_id": f"resource_{i}",
                              "price": random.randint(100, 500)
                          })


def end_english_auction(num_resources):
    for i in tqdm(range(num_resources)):
        requests.post("http://localhost:3000/api/auction/english/",
                      json={
                          "id": f"resource_{i}"
                      })


def evaluate_network(num_resources, num_bids):
    stats = {"CreateResource": 0, "CreateBid": 0, "EndEnglishAuction": 0}

    # Step 1: Create resources
    print("Creating resources...")
    start_time = time.time()
    create_resources(num_resources)
    end_time = time.time()
    stats["CreateResource"] = (end_time - start_time) / num_resources

    print("Creating bids...")
    start_time = time.time()
    create_bids(num_resources, num_bids)
    end_time = time.time()
    stats["CreateBid"] = (end_time - start_time) / (num_resources * num_bids)

    print("Ending English auctions...")
    start_time = time.time()
    end_english_auction(num_resources)
    end_time = time.time()
    stats["EndEnglishAuction"] = (end_time - start_time) / num_resources

    return stats


if __name__ == "__main__":
    num_resources = 100
    num_bids = 10

    print("Running non-optimized network.")
    run_network()
    print("Evaluating non-optimized network.")
    stats = evaluate_network(num_resources, num_bids)

    print("Running optimized network.")
    run_network(ext="-opt")
    print("Evaluating optimized network.")
    opt_stats = evaluate_network(num_resources, num_bids)

    print(stats)
    print(opt_stats)
