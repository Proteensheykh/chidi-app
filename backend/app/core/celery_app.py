from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "main-queue"},
    "app.tasks.embeddings.*": {"queue": "embeddings-queue"},
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=2,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)

# This allows you to call celery tasks directly in the same process during development
celery_app.conf.task_always_eager = settings.ENVIRONMENT == "development"
