const express = require('express');
const app = express();
const {Server} = require('socket.io');
const QRCode = require('qrcode');
const path = require('path');

const http = require('http')
const server = http.createServer(app)
const io = new Server (server);

// set up firebase
const {initializeApp, cert} = require('firebase-admin/app');
const {getFirestore, Timestamp, Filter, QuerySnapshot} = require('firebase-admin/firestore');

const serviceAccount = require('./vinhbidien-a7303-firebase-adminsdk-1bi56-5b2629a292.json');
initializeApp({
	credential: cert(serviceAccount),
});

const db = getFirestore();

// Static Files
app.use(express.static(path.join(__dirname, 'views')));
// Set Views
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'html');

app.get('/', (req, res) => {
	res.render('index')
})

io.on('connection', async (socket) =>{
	console.log('user connected')

	
})

const port = process.env.PORT || 3000;
server.listen(port, () =>{
	console.log(`listening on port  http://localhost:${port}`)
})

function sleep (ms){
	return new Promise(	resolve => setTimeout(resolve, ms));
}


async function dataQrloading() {
	
		const collections = await db.collection('QrcodeImage').orderBy('timestamp', 'desc').limit(1);
		const collect_Image = await db.collection('ImageData').orderBy('timestamp', 'desc').limit(1);

		collections.onSnapshot( querySnapshot => {
			querySnapshot.forEach(doc =>{
			const img_qrcode = doc.data().Qrcodeimage;
			const name_qrcode = doc.data().name;
			
			console.log(img_qrcode)
			QRCode.toDataURL(img_qrcode, function(err, codeimage){
				io.emit('image', codeimage, name_qrcode);
				})
			})
		})
		
		collect_Image.onSnapshot(querySnapshot =>{
			querySnapshot.forEach(doc =>{
				const urlimg = doc.data().URLImage;
				const name_urlimg = doc.data().name;
				console.log(urlimg)
				QRCode.toDataURL(urlimg, function(err, urlimage){
					io.emit('image',urlimage, name_urlimg);
				})
			})
		})
	
}
dataQrloading()