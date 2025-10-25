from fastapi import FastAPI
import uvicorn

from api.controller import router

app = FastAPI()

if __name__ == "__main__":
    app.include_router(router)
    uvicorn.run(app=app)