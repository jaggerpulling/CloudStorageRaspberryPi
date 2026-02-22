#temporary command line interface to test API requests without needing
#full frontend
import requests

BACKEND_URL = "http://127.0.0.1:8000"




def download():
    #send get request over https of files
    response = requests.get(f'{BACKEND_URL}/items')

    items = response.json()

    print(items)
    #{'items': ['car', 'bike', 'motor', 'guitar']}




def header():
    print(r"""
____________________.___                                                  .___         __  .__.__   
\______   \______   \   |   ____  ____   _____   _____ _____    ____    __| _/  __ ___/  |_|__|  |  
 |       _/|     ___/   | _/ ___\/  _ \ /     \ /     \\__  \  /    \  / __ |  |  |  \   __\  |  |  
 |    |   \|    |   |   | \  \__(  <_> )  Y Y  \  Y Y  \/ __ \|   |  \/ /_/ |  |  |  /|  | |  |  |__
 |____|_  /|____|   |___|  \___  >____/|__|_|  /__|_|  (____  /___|  /\____ |  |____/ |__| |__|____/
        \/                     \/            \/      \/     \/     \/      \/                       

 """)
        

def startMenu():
    header()
    print("1. Upload file")
    print("2. Download file")
    print("3. Delete file")
    print("4. List files")

    option = input("Enter option number: ")

    commands = {
        "2": download,
    }

    if option in commands:
        commands[option]()
    else:
        print("Unknown command")

startMenu()