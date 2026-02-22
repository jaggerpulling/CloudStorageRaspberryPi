from fastapi import FastAPI

app = FastAPI()


item_list = ["car","bike","motor","guitar"]

 
@app.get("/items") #whenever someone makes a get request run the function
async def items(): #called whenever it receives request to url "/" using a GET operation
    return {"items": item_list}


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