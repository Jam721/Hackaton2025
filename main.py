from fastapi import FastAPI
import uvicorn

from api.controller import router

app = FastAPI()

if __name__ == "__main__":
    app.add_api_route(router)
    uvicorn.run(app=app)