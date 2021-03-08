const express = require('express');
const bodyParser = require('body-parser');
var QRCode = require('qrcode');
const app = express();
let ejs = require("ejs");
let fs = require("fs");
let pdf = require("html-pdf");
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/',(req,res)=>{
  res.render('index')
})

app.post("/", async (req, res) => {

  let a=req.body;

  // oy yilni taxlaymiz
  let date = new Date();
  let month = date.getMonth() + 1;
  month = (month < 10 ? '0' + month : month)
  let day = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  date = day + '.' + month + '.' + date.getFullYear()

  const fileName = `${+new Date()}.pdf`;
  const pdfPath = __dirname + `/public/${fileName}`;
console.log(fileName.substring(fileName.length-4,4))
  
   QRCode.toDataURL(`https://qrcode-uz.herokuapp.com/fayllar/${fileName.substr(0,fileName.length-4)}`,(err,url)=>{
    let options = {
      fakultet: a.fakultet,
      guruh: a.guruh,
      fish: a.fish,
      sabab: a.sabab,
      qr:url,
      vaqt:new Date().toLocaleString(),
      sana: date,
      format: "Letter",
      orientation: "landscape",
      border: {
        top: '0in', // default is 0, units: mm, cm, in, px
        right: '0.1cm',
        bottom: '0in',
        left: '0in'
      },
    }
  
  
  
    res.render('ariza', options, (err, data) => {
      console.log(err)
      if (err) return res.status(404).json({
        error: err
      })
  
  
      pdf.create(data, options).toStream(function (err, stream) {
        if (err) return res.end(err.stack)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Ariza.pdf');
        stream.pipe(res);
        
  
        
        stream.pipe(fs.createWriteStream(pdfPath));
  
      });
  
  
  
    }); 
    });
   
  
 
  // console.log(qr)
  // console.log(run())

  

  // res.download(path.join(__dirname, "/public/Ariza.pdf"));







})

app.get("/fayllar/:id",(req,res)=>{
  res.download(__dirname+ `/public/${req.params.id}.pdf`);
})


//connection create
const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
  console.log("Server is running at port 3000");
})