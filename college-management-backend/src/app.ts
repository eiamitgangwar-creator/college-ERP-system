import express from 'express';
import cors from 'cors';
import rootRouter from './routes';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', rootRouter);


app.get('/', (req, res) => {
   
    res.json({ message: 'Welcome to School Management System API' });
});


export default app; 
