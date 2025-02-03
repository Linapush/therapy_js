
import supertest from 'supertest';
import app from '../app.js';

const requestWithSupertest = supertest(app);

let token = "";
let postId = "";

describe("test", () => {
    it("login", async () => {
        let user = {
            "username":"user1",
            "password":"user1",
        }
        const res = await requestWithSupertest
            .post("/login")
            .send(user)
            .expect(200)
        token = res.body.token;
        expect(res.statusCode).toBe(200);
    });

    it("should return all posts", async () => {
        const res = await requestWithSupertest
            .get("/posts")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.statusCode).toBe(200);
    });

    it("should return main page", async () => {
        const res = await requestWithSupertest
            .get("/")
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        expect(res.statusCode).toBe(200);
    });

    it("should return admin page", async () => {
        const res = await requestWithSupertest
            .get("/")
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        expect(res.statusCode).toBe(200);
    });

    it("create post", async () => {
        let post = {
            "title":"test create post",
            "body":"test create post",
        }
        const res = await requestWithSupertest
            .post("/create-post")
            .set('Authorization', `Bearer ${token}`)
            .send(post);
            expect(res.statusCode).toBe(200);

    });

    it("create post page", async () => {
        const res = await requestWithSupertest
            .get("/create-post")
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it("add post", async () => {
        let post = {
            "title":"3 post from me",
            "body":"hi, i'm here",
        }
        const res = await requestWithSupertest
            .post("/add-post")
            .set('Authorization', `Bearer ${token}`)
            .send(post);
        postId = res.body._id
        console.log(postId)
        expect(res.statusCode).toBe(200);
    });

    it("create post invalid", async () => {
        let post = {
            "title":"post without body",
            "body":"",
        }
        const res = await requestWithSupertest
            .post("/create-post")
            .set('Authorization', `Bearer ${token}`)
            .send(post)
        expect(res.statusCode).toBe(404);

    });

    it("add post invalid", async () => {
        let post = {
            "title":"3 post from me",
            "body":"",
        }
        const res = await requestWithSupertest
            .post("/add-post")
            .set('Authorization', `Bearer ${token}`)
            .send(post);
        expect(res.statusCode).toBe(404);
    });

    it("add post page", async () => {
        const res = await requestWithSupertest
            .get("/add-post")
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it("auth page", async () => {
        const res = await requestWithSupertest
            .get("/auth");
        expect(res.statusCode).toBe(200);
    });

    it("show one post", async () => {
        const res = await requestWithSupertest
            .get("/one-post/" + postId)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it("show post page", async () => {
        const res = await requestWithSupertest
            .get("/post/" + postId)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it("edit post", async () => {
        let post = {
            "title":"edit post",
            "body":"edit body",
        }
        console.log("'/edit-post/' + postId")
        console.log("/edit-post/" + postId)
        const res = await requestWithSupertest
            .put("/edit-post/" + postId)
            .set('Authorization', `Bearer ${token}`)
            .send(post);
        expect(res.statusCode).toBe(200);
    });

    it("edit post page", async () => {
        const res = await requestWithSupertest
            .get("/edit-post/" + postId)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it("delete post", async () => {
        const res = await requestWithSupertest
            .delete("/delete-post/" + postId)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
    });

    it("registration", async () => {
        let user = {
            "username":"userTest",
            "password":"userTest",
        }
        const res = await requestWithSupertest
            .post("/registration")
            .send(user);
            expect(res.statusCode).toBe(200);
        await removeUserFromDatabase(user);
    });

    it("registration invalid", async () => {
        let user = {
            "username":"userTestInvalid",
            "password":"123",
        }
        const res = await requestWithSupertest
            .post("/registration")
            .send(user);
        expect(res.statusCode).toBe(400);
    });

    it("login invalid", async () => {
        let user = {
            "username":"userInvalid",
            "password":"12345",
        }
        const res = await requestWithSupertest
            .post("/login")
            .send(user)
        expect(res.statusCode).toBe(400);
    });

    async function removeUserFromDatabase(user) {
        const User = await import('../server/models/User.js');
        await User.default.findOneAndRemove({ username: user.username });
    }
});
