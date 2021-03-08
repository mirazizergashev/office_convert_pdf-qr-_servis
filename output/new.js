const express = require('express');
const clean=require('./clean');
const {
    PDFNet
} = require('@pdftron/pdfnet-node');
const fileUpload = require('express-fileupload');
const app = express();
const HummusRecipe = require('hummus-recipe');

var QRCode = require('qrcode');
const PDFMerger = require('pdf-merger-js');
var merger = new PDFMerger();

const fs = require('fs');
const path = require('path')
// const pdfDoc = new HummusRecipe('input.pdf', 'output.pdf');

// default options
app.use(fileUpload());
// app.use(require('./clean'))

const type = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg']

app.get('/', (req, res) => {
    res.render('index.ejs', {
        msg: ""
    })
})

app.post('/', (req, res) => {
    res.render('index.ejs', {
        msg: ""
    })
})

app.get('/upload', (req, res) => {
    res.redirect('/');
})

app.post('/upload', function (req, res) {
    var vaqt = `${+new Date()}`;
    let tip = req.files.file.mimetype;
    let k = false;
    const pdfDoc = new HummusRecipe('new', `pdf_qr/${vaqt}.pdf`, {
        version: 1.6,
        author: 'John Doe',
        title: 'Hummus Recipe',
        subject: 'A brand new PDF'
    });
    const fileName = `img_qr/${vaqt}.png`;

    for (let i = 0; i < type.length; i++) {
        if (type[i] == tip) {
            k = true;
            break;
        }

    }



    //fayl yuklanmadi
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.render('index.ejs', {
            msg: "Fayl yuklanmadi"
        });
    }


    //xato tip
    if (!k) {
        return res.render('index.ejs', {
            msg: `Faylingiz tipi biz aytgan formatda emas u siz ${tip} shaklda yukladingiz !!!`
        });
    }

    //png va jpg file bolsa
    if ((tip == type[5]) || (tip == type[6])) {
        // return res.render('index.ejs', {
        //     msg: `Faylingizni  ${tip} shaklda yukladingiz yani rasm korinishida !!!`
        // });
        // console.log('jpg')
        let sampleFile = req.files.file

        sampleFile.mv(`img_qr/${sampleFile.name}`, function (err) {
            if (err) {
                return res.status(500).send(err)
            } 
        })


        sampleFile.mv(`upload/${vaqt}.pdf`, function (err) {
            if (err) {
                return res.status(500).send(err);
            }


            QRCode.toFile(fileName, [{
                data: `https://pdf-to-qr.herokuapp.com/upload/${vaqt}`,
                mode: 'byte'
            }], (err, fff) => {



                pdfDoc
                    .createPage('letter-size').image(`${fileName}`, 20, 100, {
                        width: 200,
                        keepAspectRatio: true
                    })
                    .endPage()
                    .createPage('letter-size').image(`img_qr/${sampleFile.name}`, 25, 5, {
                        width: 565,
                        height: 800,
                        keepAspectRatio: true
                    })
                    .endPage()
                    .endPDF();

                (async () => {
                    merger.add(`pdf_qr/${vaqt}.pdf`); //merge all pages. parameter is the path to file and filename.
                    // merger.add(`upload/${vaqt}.pdf`); // merge only page 2

                    await merger.save(`output/${vaqt}.pdf`).then(q => {
                        var filePath = `output/${vaqt}.pdf`;
                        var rootpath = path.join(__dirname + '/' + filePath);

                        fs.readFile(filePath, function (err, data) {
                            // console.log(err)
                            if(err) {
                                return res.redirect('/')
                            }
                            res.setHeader('Content-Type', 'application/pdf');
                            res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');


                            return res.send(data)

                        });
                    }); //save under given name
                })();




            })


        });
    }



    //doc va docx file bolsa
    if ((tip == type[1]) || (tip == type[2]) || (tip == type[3]) || (tip == type[4])) {
        // return res.render('index.ejs', {
        //     msg: `Faylingizni  ${tip} shaklda yukladingiz yani docx !!!`
        // });
        let sampleFile = req.files.file
        // console.log(sampleFile)
        sampleFile.mv(`upload/${sampleFile.name}`, function (err) {
            if (err)
                return res.status(500).send(err);
        })







        const inputPath = `upload/${sampleFile.name}`
        const outputPath = `upload/${vaqt}.pdf`;

        const main = async () => {
            const pdfdoc = await PDFNet.PDFDoc.create();
            await pdfdoc.initSecurityHandler();
            await PDFNet.Convert.toPdf(pdfdoc, inputPath);
            pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
        };

        PDFNet.runWithCleanup(main) // you can add the key to PDFNet.runWithCleanup(main, process.env.PDFTRONKEY)
            .then(() => {
                PDFNet.shutdown();
                fs.readFile(outputPath, (err, data) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(`Error getting the file: ${err}.`);
                    } else {
                        //   // const ext = path.parse(pathname).ext;
                        //   res.setHeader('Content-type', 'application/pdf');
                        //   res.end(data);

                        QRCode.toFile(fileName, [{
                            data: `https://pdf-to-qr.herokuapp.com/upload/${vaqt}`,
                            mode: 'byte'
                        }], (err, fff) => {



                            pdfDoc
                                .createPage('letter-size').image(`${fileName}`, 20, 100, {
                                    width: 200,
                                    keepAspectRatio: true
                                })
                                .endPage()
                                .endPDF();

                            (async () => {
                                merger.add(`pdf_qr/${vaqt}.pdf`); //merge all pages. parameter is the path to file and filename.
                                merger.add(`upload/${vaqt}.pdf`); // merge only page 2

                                await merger.save(`output/${vaqt}.pdf`).then(q => {
                                    var filePath = `output/${vaqt}.pdf`;
                                    var rootpath = path.join(__dirname + '/' + filePath);

                                    fs.readFile(filePath, function (err, data) {
                                        // console.log(err)
                                        if(err) {
                                            return res.redirect('/')
                                        }
                                        res.setHeader('Content-Type', 'application/pdf');
                                        res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');


                                        return res.send(data)

                                    });
                                }); //save under given name
                            })();




                        })
                    }
                });
            })
            .catch(error => {
                res.statusCode = 500;
                res.end('errr');
            });

    }

    //pdf bolsa
    if (type[0] == tip) {
        let sampleFile = req.files.file

        sampleFile.mv(`upload/${vaqt}.pdf`, function (err) {
            if (err)
                return res.status(500).send(err);

            QRCode.toFile(fileName, [{
                data: `https://pdf-to-qr.herokuapp.com/upload/${vaqt}`,
                mode: 'byte'
            }], (err, fff) => {


                pdfDoc
                    .createPage('letter-size').image(`${fileName}`, 20, 100, {
                        width: 200,
                        keepAspectRatio: true
                    })
                    .endPage()
                    .endPDF();
                (async () => {
                    merger.add(`pdf_qr/${vaqt}.pdf`); //merge all pages. parameter is the path to file and filename.
                    merger.add(`upload/${vaqt}.pdf`); // merge only page 2

                    await merger.save(`output/${vaqt}.pdf`).then(q => {
                        var filePath = `output/${vaqt}.pdf`;

                        fs.readFile(filePath, function (err, data) {
                            res.setHeader('Content-Type', 'application/pdf');
                            res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');
                            res.contentType("application/pdf");
                            res.send(data);
                        });
                    }); //save under given name
                })();
            })


        });
    }




});

app.get("/upload/:id", (req, res) => {
    res.download(__dirname + `/output/${req.params.id}.pdf`);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, (req, res) => {
    console.log("Server is running at port 3001");
})