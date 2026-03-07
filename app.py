from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from fastapi import HTTPException
import os
from pathlib import Path
from datetime import datetime
import mimetypes
from fastapi.middleware.cors import CORSMiddleware

#TEMP PATH FOR TESTING// CHANGE TO RPI STORAGE
STORAGE_PATH = "D:\cloud"

app = FastAPI()

# Allow requests from your frontend origin
origins = [
    "http://localhost:5173",  # your Svelte dev server
    # "http://127.0.0.1:5173"  # sometimes needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)

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

@app.delete("/file/delete/{filename}")
async def delete_item(filename: str):
    path = os.path.join(STORAGE_PATH, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(path)
    return {"message": f"{filename} deleted successfully"}

@app.get("/storage/data")
async def get_storage_data():
    try:
        storage_path = Path(STORAGE_PATH)
        if not storage_path.exists():
            raise HTTPException(status_code=404, detail="Storage path not found")
        
        # Get all files
        files = []
        total_used = 0
        storage_by_type = {}
        
        for file_path in storage_path.rglob('*'):
            if file_path.is_file():
                stat = file_path.stat()
                size = stat.st_size
                total_used += size
                
                # Determine file type category
                mime_type, _ = mimetypes.guess_type(str(file_path))
                if mime_type:
                    category = mime_type.split('/')[0]  # 'image', 'video', 'text', etc.
                else:
                    category = 'other'
                
                storage_by_type[category] = storage_by_type.get(category, 0) + size
                
                files.append({
                    "id": str(file_path.relative_to(storage_path)),
                    "name": file_path.name,
                    "size": size,
                    "type": mime_type or "application/octet-stream",
                    "lastModified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "path": str(file_path.relative_to(storage_path))
                })
        
        # For demo purposes, assume 15GB total storage
        # In production, you'd get this from system calls
        total_storage = 15 * 1024**3  # 15GB
        
        return {
            "totalStorage": total_storage,
            "usedStorage": total_used,
            "files": files,
            "storageByType": storage_by_type,
            "lastUpdated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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