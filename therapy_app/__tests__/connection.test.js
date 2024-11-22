import request from 'supertest';
import therapy_app from '../app.js';


describe('app routes', () => {
    afterAll(() => {
        therapy_app.close();
    });

    it('should serve the index.html on GET /', async () => {
        const res = await request(therapy_app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.header['content-type']).toContain('text/html');
    });

    it('should handle 404 for unknown routes', async () => {
        const res = await request(therapy_app).get('/unknown-route');
        expect(res.statusCode).toBe(404);
    });

    it('should handle simulated error on /test-error', async () => {
        const res = await request(therapy_app).get('/test-error');
        expect(res.statusCode).toBe(500);
        expect(res.text).toContain('Ошибка транзакции');
    });
});


// describe('POST /sessions', () => {
//     it('should create a new session with valid data', async () => {
//         const mockSessionData = { patient_id: 1, therapist_id: 2, date: '2024-03-15', time: '10:00', notes: 'Test notes' };
//         pool.query.mockResolvedValue({ rows: [ {id: 1, ...mockSessionData} ] }); // Mock successful insertion

//         const res = await request(app)
//             .post('/sessions')
//             .set('Authorization', `Bearer ${process.env.JWT_TOKEN}`)
//             .send(mockSessionData);

//         expect(res.statusCode).toBe(201);
//         expect(res.body.message).toBe('Session added successfully');
//         expect(pool.query).toHaveBeenCalledWith(
//             'INSERT INTO sessions (patient_id, therapist_id, date, time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//             [mockSessionData.patient_id, mockSessionData.therapist_id, mockSessionData.date, mockSessionData.time, mockSessionData.notes]
//         );
//     });


//     it('should return 400 error for invalid data', async () => {
//         const mockInvalidSessionData = { patient_id: 'abc', therapist_id: 2, date: '2024-03-15', time: '10:00', notes: 'Test notes' };

//         const res = await request(app)
//             .post('/sessions')
//             .set('Authorization', 'Bearer <your_test_token>')
//             .send(mockInvalidSessionData);

//         expect(res.statusCode).toBe(400);
//         expect(res.body.errors).toBeDefined();
//     });


//     it('should return 403 for unauthorized access', async () => {
//         const mockSessionData = { patient_id: 1, therapist_id: 2, date: '2024-03-15', time: '10:00', notes: 'Test notes' };
//         const res = await request(app)
//             .post('/sessions')
//             .send(mockSessionData);

//         expect(res.statusCode).toBe(403);
//     });

// });


// describe('GET /sessions', () => {
//     it('should return all sessions', async () => {
//         const mockSessions = [{ id: 1, patient_id: 1, therapist_id: 2, date: '2024-03-15', time: '10:00', notes: 'Test notes' },
//         { id: 2, patient_id: 3, therapist_id: 4, date: '2024-03-16', time: '14:30', notes: 'Another session' }];
//         pool.query.mockResolvedValue({ rows: mockSessions });

//         const res = await request(app).get('/sessions');
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual(mockSessions);
//         expect(pool.query).toHaveBeenCalledWith('SELECT * FROM sessions');
//     });

//     it('should handle database errors', async () => {
//         pool.query.mockRejectedValue(new Error('Database error'));
//         const res = await request(app).get('/sessions');
//         expect(res.statusCode).toBe(500);
//         expect(res.body.error).toBeDefined();
//     });
// });


// describe('GET /sessions/:id', () => {
//     it('should return a specific session', async () => {
//         const mockSession = { id: 1, patient_id: 1, therapist_id: 2, date: '2024-03-15', time: '10:00', notes: 'Test notes' };
//         pool.query.mockResolvedValue({ rows: [mockSession] });

//         const res = await request(app).get('/sessions/1');
//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual(mockSession);
//         expect(pool.query).toHaveBeenCalledWith('SELECT * FROM sessions WHERE id = $1', [1]);
//     });

//     it('should return 404 if session not found', async () => {
//         pool.query.mockResolvedValue({ rows: [] });
//         const res = await request(app).get('/sessions/999');
//         expect(res.statusCode).toBe(404);
//         expect(res.body.error).toBeDefined();
//     });

//     it('should handle database errors', async () => {
//         pool.query.mockRejectedValue(new Error('Database error'));
//         const res = await request(app).get('/sessions/1');
//         expect(res.statusCode).toBe(500);
//         expect(res.body.error).toBeDefined();
//     });
// });


// describe('PUT /sessions/:id', () => {
//     it('should update a session', async () => {
//         const mockUpdatedSession = { patient_id: 1, therapist_id: 2, date: '2024-03-16', time: '14:00', notes: 'Updated notes' };
//         pool.query.mockResolvedValueOnce({rows: [{id:1, ...mockUpdatedSession}]})
//         .mockResolvedValueOnce({rows: [{id:1, ...mockUpdatedSession}]});

//         const res = await request(app)
//             .put('/sessions/1')
//             .set('Authorization', `Bearer ${process.env.JWT_TOKEN}`) 
//             .send(mockUpdatedSession);

//         expect(res.statusCode).toBe(200);
//         expect(res.body).toEqual(mockUpdatedSession);
//         expect(pool.query).toHaveBeenCalledTimes(2);
//     });


// });

// describe('DELETE /sessions/:id', () => {
//     it('should delete a session', async () => {
//         pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
//         const res = await request(app)
//             .delete('/sessions/1')
//             .set('Authorization', `Bearer ${process.env.JWT_TOKEN}`);

//         expect(res.statusCode).toBe(200);
//         expect(res.body.message).toBe('Session deleted successfully');
//         expect(pool.query).toHaveBeenCalledWith('DELETE FROM sessions WHERE id = $1 RETURNING *', [1]);
//     });
// });