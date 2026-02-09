#temporary command line interface to test API requests without needing
#full frontend




def header():
    print("""
____________________.___                                                  .___         __  .__.__   
\______   \______   \   |   ____  ____   _____   _____ _____    ____    __| _/  __ ___/  |_|__|  |  
 |       _/|     ___/   | _/ ___\/  _ \ /     \ /     \\__  \  /    \  / __ |  |  |  \   __\  |  |  
 |    |   \|    |   |   | \  \__(  <_> )  Y Y  \  Y Y  \/ __ \|   |  \/ /_/ |  |  |  /|  | |  |  |__
 |____|_  /|____|   |___|  \___  >____/|__|_|  /__|_|  (____  /___|  /\____ |  |____/ |__| |__|____/
        \/                     \/            \/      \/     \/     \/      \/                       

 """)
        

def startMenu():
    header()
    print("Please select an option:")
    print("1. Upload file")
    print("2. Download file")
    print("3. Delete file")
    print("4. List files")
    option = input("Enter option number: ")

    commands = [upload, download, delete, listFiles]
    numCommands = len(commands)

    #print options
    if option in commands:
        if option == "1":
            commands[1]()
            pass
        
        if option == "2":
            commands[2]()
            pass
        
        if option == "3":
            commands[3]()
            pass
        
        if option == "4":
            commands[4]()
            pass
    else:
        print(f"unknown command, please select options 1 - {numCommands + 1}")
