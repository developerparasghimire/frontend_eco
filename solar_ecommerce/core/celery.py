"""
Celery application for Solar e-commerce.

Tasks live next to the apps that own them (e.g. apps.orders.tasks). Celery
auto-discovers them via INSTALLED_APPS.

Run a worker:        celery -A core worker -l info
Run the scheduler:   celery -A core beat -l info
"""
import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('solar')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):  # pragma: no cover
    print(f'Request: {self.request!r}')
