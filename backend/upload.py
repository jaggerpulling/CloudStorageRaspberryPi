from fastapi import FastAPI

app = FastAPI()

 
@app.get("/") #whenever someone makes a get request run the function
async def root(): #called whenever it receives request to url "/" using a GET operation
    return {"message": "Hello World"}

@app.post("/upload file")
async def file_upload() 

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