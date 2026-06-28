import "dotenv/config";
import "./src/server.js";


app.use(cors());

app.use(express.json());



// Routes later

app.get("/",(req,res)=>{

res.json({
message:"Healix AI Backend Running"
})

});



mongoose.connect(process.env.MONGO_URI)

.then(()=>{

console.log("MongoDB Connected");

app.listen(5000,()=>{

console.log("Server running on port 5000");

});

})

.catch((err)=>{

console.log(err);

});