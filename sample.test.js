const request = require('supertest')
const app = require('./index')
describe('Post Endpoints', () => {
    it('should create a new post', async () => {
        const res = await request(app)
            .post('/movie')
            .send({
                "name": "T44",
                "year": 2020,
                "director": "Christopher Nolan"
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message');
    });
});
describe('Multiple post Endpoints', () => {
    it('should create new posts', async () => {
        const res = await request(app)
            .post('/movies')
            .send([{
                "name": "T45",
                "year": 2020,
                "director": "Christopher Nolan"
            },
            {
                "name": "T46",
                "year": 2020,
                "director": "Christopher Nolan"
            }]);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message');
    });
});
describe('get Endpoints', () => {
    it('should return record', async () => {
        const res = await request(app)
            .get('/movies?query=Ten')
         
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
    });
});