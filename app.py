from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse

import os

#TEMP PATH FOR TESTING// CHANGE TO RPI STORAGE
STORAGE_PATH = "D:\cloud"

app = FastAPI()


item_list = ["car","bike","motor","guitar"]

 
@app.get("/items") #whenever someone makes a get request run the function
async def items(): #called whenever it receives request to url "/" using a GET operation
    return {"items": item_list}

@app.post("/file/upload")
async def upload_file(file: UploadFile):
    path = f"{STORAGE_PATH}/{file.filename}"
    contents = await file.read() #get bytes of file
    with open(path, "wb") as f:
        f.write(contents) # write file 
    return {"message": f"Upload successful, {file.filename} uploaded to {path}"} 

@app.get("/file/download/{filename}")
async def download_file(filename: str):
    path = os.path.join(STORAGE_PATH, filename)
    return FileResponse(path)

    


#common operations
"""
POST: to create data.
GET: to read data.
PUT: to update data.
DELETE: to delete data.

"""

#check for file upload
#currently doing so by monitoring file directory

#upon file appearing 

#send post request to fastAPI

#do something with sql lite