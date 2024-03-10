const {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users',  async(req, res, next)=> {
    try {
        res.send(await fetchUsers());
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/products',  async(req, res, next)=> {
    try {
        res.send(await fetchProducts());
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/users/:user_id/favorites',  async(req, res, next)=> {
    try {
        res.send(await fetchFavorites(req.params.user_id));
    }
    catch(ex){
        next(ex);
    }
});

app.delete('/api/users/:user_id/favorites/:id',  async(req, res, next)=> {
    try {
        await destroyFavorite({user_id: req.params.user_id, id: req.params.id});
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});

app.post('/api/users/:user_id/favorites',  async(req, res, next)=> {
    try {
        res.status(201).send(await createFavorite({ user_id: req.params.user_id, product_id: req.body.product_id, favorite_date: req.body.favorite_date}));
    }
    catch(ex){
        next(ex);
    }
});

app.use((err, req, res, next)=> {
    res.status(err.status || 500).send({ error: err.message || err});
});
const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [me, you, she, he, phone, bike, watch, TV] = await Promise.all([
        createUser({ username: 'me', password: 'me!' }),
        createUser({ username: 'you', password: 'you!!' }),
        createUser({ username: 'she', password: 'shhh' }),
        createUser({ username: 'he', password: 'shhh' }),
        createProduct({ name: 'phone'}),
        createProduct({ name: 'bike'}),
        createProduct({ name: 'watch'}),
        createProduct({ name: 'TV'}),
    ]);
    console.log(await fetchUsers());
    console.log(await fetchProducts());
    
    const favorites = await Promise.all([
    createFavorite({ user_id: me.id, product_id: phone.id}),
    createFavorite({ user_id: he.id, product_id: bike.id}),
    createFavorite({ user_id: you.id, product_id: watch.id}),
    createFavorite({ user_id: she.id, product_id: TV.id}),
    ]);
    
    console.log(await fetchFavorites(me.id));
    await destroyFavorite({ user_id: me.id, id: favorites[0].id});
    console.log(await fetchFavorites(me.id));
    
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log(`curl localhost:${port}/api/users/${me.id}/favorites`);
    
        console.log(`curl -X POST localhost:${port}/api/users/${you.id}/favorites -d '{"product_id": "${bike.id}"}' -H 'Content-Type:application/json'`);
        console.log(`curl -X DELETE localhost:${port}/api/users/${you.id}/favorites/${favorites[3].id}`);
      
        console.log('data seeded');
    });
};

init();