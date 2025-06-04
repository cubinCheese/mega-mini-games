import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_brick_images_api(client):
    response = client.get('/api/brick-images')
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)

def test_snake_images_api(client):
    response = client.get('/api/snake-images')
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)