const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const path = require('path')
const { error } = require('console')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: false }))

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           
  password: '',             
  database: 'registration_db'
})

db.connect(err =>{
    if (err) throw err
    console.log('veri tabanina baglandi')
})

app.get('/', async(req,res) =>{
    res.sendFile(path.join(__dirname, 'views', 'register.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
})

app.post('/register', async(req,res)=>{
    const {name, email, password} = req.body
  
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        db.query('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name,email, hashedPassword], (error)=>{
            if (error) {
                console.error('DB insert hatasi', error)
                res.send('Kullaniciyi kayit etme hatasi')
            } else{
                res.send('Kayit basarili!')
            }
        })
    } catch (error) {
        console.error('hashleme hatasi', error)
        res.send('Sunucu Hatasi')
    }
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Veritabani hatasi:', err);
      return res.send('Sunucu hatasi');
    }

    if (results.length === 0) {
      return res.send('O email hesabina bagli bir hesap bulunmamaktadir!');
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.send(`Hosgeldin, ${user.name}!`);
    } else {
      res.send('Yanlis sifre');
    }
  })
})