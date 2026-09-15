import mongoose from 'mongoose';

const connectDB = async () : Promise<void> => { 
    try {
        
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/collegeDB';

const conn = await mongoose.connect(mongoURI);
console.log(` MongoDB Connected to Fresh Database: ${conn.connection.name}`);

    
    } catch (err : any) {
        console.error("Database Connection Failed ", err.message);
        process.exit(1);
    }
};

export default connectDB;
