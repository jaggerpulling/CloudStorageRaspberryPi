#temporary command line interface to test API requests without needing

#tkinter library for file dialog and expanding frontend
import tkinter as tk
from tkinter import filedialog

root = tk.Tk()
root.withdraw()


#full frontend
import requests

BACKEND_URL = "http://127.0.0.1:8000"



def download():
    # ask for save location
    save_path = filedialog.asksaveasfilename(
        title="Save file as",
        initialfile="downloaded_file.txt"
    )
    filename = input("file name: ") 
    file_data = requests.get(f"{BACKEND_URL}/file/download/{filename}")

    with open(save_path, "wb") as f:
        f.write(file_data.content)

def delete():
    filename = input("file to delete: ")
    response = requests.delete(f"{BACKEND_URL}/file/delete/{filename}")
    
    if response.status_code == 200:
        print("Deleted:", response.json()["message"])
    elif response.status_code == 404:
        print("Error: file not found")
    else:
        print("Error:", response.status_code, response.text)



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
        "3": delete
    }

    if option in commands:
        commands[option]()
    else:
        print("Unknown command")

startMenu()