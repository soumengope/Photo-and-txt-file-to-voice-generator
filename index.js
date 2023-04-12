const fs = require('fs');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const say = require('say')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const path = require("path");
const static_css = path.join(__dirname,"/public/css"); 
app.use("/css",express.static(static_css));
app.use(fileUpload());
app.use(bodyParser.json());

app.set("views","./views") ;
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.render("index",{message:"Look current status here"})
})

app.post("/",(req,res)=>{
    if(req.body.submit=='upload'){
        fs.readdir('./upload/', (err, files) => {
            if(err){
                //throw err
                res.render("index",{message:"Directory can't readable"})
            };
            for (const file of files) {
                fs.unlink(path.join('./upload/', file), (err) => {
                if(err){
                    //throw err;
                    res.render("index",{message:"File not deletable"})
                }
            });
          }
        })
        if(req.files){
            if(req.files.file.mimetype == 'application/pdf'){
                let file = req.files.file;
                let filename= req.files.file.name;
                let ext = filename.split('.').slice(-1).join();
                file.mv('./upload/'+"mydata"+"."+ext, function(err){
                    if(err){
                        res.render("index",{message:"Pdf file isn't uploaded"});
                    }else{
                        res.render("index",{message:"Pdf file is uploaded,now press play"});
                    }
                })
            }else if(req.files.file.mimetype=='image/jpeg' || 
            req.files.file.mimetype=='image/jpg' || req.files.file.mimetype=='image/png'){
                let file = req.files.file;
                let filename= req.files.file.name;
                let ext = filename.split('.').slice(-1).join();
                file.mv('./upload/'+"mydata"+"."+ext, function(err){
                    if(err){
                        res.render("index",{message:"Image file isn't uploaded"});
                    }else{
                        res.render("index",{message:"Image file uploaded, now press play"}); 
                    }
                })
            }else if(req.files.file.mimetype=='text/plain'){
                let file = req.files.file;
                let filename= req.files.file.name;
                let ext = filename.split('.').slice(-1).join();
                file.mv('./upload/'+"mydata"+"."+ext, function(err){
                    if(err){
                        res.render("index",{message:"Text file isn't uploaded"});
                    }else{
                        res.render("index",{message:"Text file uploaded, now press play"}); 
                    }
                })
            }
            else{
                res.render("index",{message:"Choose pdf or image file only"});
            }
        }else{
            res.render("index",{message:"Choose a file please"})
        }
    }else if(req.body.play=='play'){
        fs.readdir('./upload/', (err, files) => {
            if(err){
                //console.log(err)
                res.render("index",{message:"Directory can't readable"})
            }else{
                if (fs.existsSync('./upload/mydata.pdf') || fs.existsSync('./upload/mydata.png')
                ||fs.existsSync('./upload/mydata.jpg') || fs.existsSync('./upload/mydata.jpeg') ||
                fs.existsSync('./upload/mydata.txt' )){
                    files.forEach(file => {
                        let ext = file.split('.').slice(-1).join();
                        if(ext=='pdf'){
                            const pdfFile = fs.readFileSync('./upload/mydata.pdf');
                            pdfParse(pdfFile).then( (data)=>{
                                res.render("index",{message:"Playing music"})
                                say.speak(data.text);
                            }).catch((err)=>{
                                //console.log(err);
                                res.render("index",{message:"Error pdf file can't readable"})
                            })
                            say.stop()
                        }else if(ext=='png' || ext=='jpg' || ext=='jpeg'){
                            Tesseract.recognize('./upload/'+'mydata.'+ext,'eng').then(data=>{
                                res.render("index",{message:"Playing music"})
                                say.speak(data.data.text);
                            })
                            say.stop()
                        }else if(ext=='txt'){
                            try {  
                                var data = fs.readFileSync('./upload/mydata.txt', 'utf8');
                                res.render("index",{message:"Playing music"})
                                say.speak(data.toString());    
                            } catch(e) {
                                //console.log('Error:', e.stack);
                                res.render("index",{message:"Error text file can't readable"})
                            }
                        }else{
                            res.render("index",{message:"Only pdf and image file support"})
                        }
                    });
                }else{
                    res.render("index",{message:"File not exists, upload a file"})
                }
            }
          });
    }else if(req.body.stop=='stop'){
        if(fs.existsSync('./upload/mydata.pdf') || fs.existsSync('./upload/mydata.png')
            ||fs.existsSync('./upload/mydata.jpg') || fs.existsSync('./upload/mydata.jpeg')||
            fs.existsSync('./upload/mydata.txt')){
                res.render("index",{message:"Stoped music"})
                say.stop();
        }else{
            res.render("index",{message:"File not exists, upload a file"})
        }
    }
})
app.listen(port,()=>{
    console.log(`Listening ${port}`);
})