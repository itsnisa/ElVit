import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
<<<<<<< HEAD
    uvicorn.run("api.main:app", host="0.0.0.0", port=port)
=======
    uvicorn.run("api.main:app", host="0.0.0.0", port=port)
>>>>>>> 04223921dba98899596735d7a97cb1de184e3534
