const path = require('path');
const fs = require('fs')
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf  = require("csurf");
const flash = require('connect-flash');
const multer =require('multer');
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')


const errorController = require('./controllers/error');
const User = require('./models/user');

console.log(process.env.NODE_ENV)

const MONGODB_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.0bms1.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {  // 파일 업로드 될때의 저장소
    cb(null, 'images');   //images 라는 폴더에 저장됨
  
  },
  filename: (req, file, cb) => {  // 파일 이름 생성
    const safeFileName = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;
    cb(null, safeFileName);
  }
});
console.log(fileStorage);

const fileFilter = (req, file, cb) => {  //파일 유형 지정
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(path.join
  (__dirname,  'access.log'), 
  {flags: 'a'}
);


app.use(helmet());
app.use(compression());
app.use(morgan('combined' , { stream: accessLogStream }))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err =>{
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next)=>{
  //res.render();
  console.log('에러' ,error);
  res.redirect('/500');
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
  // SSL 인증서 사용시 설정 방법
    // https.createServer({key: privateKey , cert: certificate} , app)
    // .listen(process.env.PORT || 3000);
  // 단순 서버 설정
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
