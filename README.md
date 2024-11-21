# Приложение для отслеживания приемов пациентов у терапевта

## Создание базы, заполнение тестовыми данными

`chmod +x database/create_db.sh ./database/create_db.sh`

## Запуск проекта

`node app.js``
Доступный адрес: http://localhost:8005

## Доступные эндпоинты

### Доступно пользователю


`POST http://localhost:8005/register`
* Body:
{
    "username": "some_user",
    "password": some@pass123
}

`POST http://localhost:8005/login`
* Body:
{
    "username": "some_user",
    "password": some@password123,
    "role": patient
}

`GET http://localhost:8005/dashboard`

`GET http://localhost:8005/sessions/`

`GET http://localhost:8005/sessions/{id}`


### Доступные администратору

`GET http://localhost:8005/admin/login`
`GET http://localhost:8005/admin/dashboard`

`GET http://localhost:8005/sessions`
* Смотрим прием у терапевта

`POST http://localhost:8005/sessions`
* Создаем прием у терапевта
* Body:
{
    "patient_id": 2,
    "therapist_id": 1,
    "date": "2024-11-30T21:00:12.000Z",
    "time": "10:00:00",
    "notes": "Nervousness, anxiety. Sedatives are prescribed."
}

`POST http://localhost:8005/sessions/6`
* Изменяем прием у терапевта
* Body:
{   
    "time": "12:00:00"
}

`DELETE http://localhost:8005/sessions/6`
* Удаляем прием у терапевта
