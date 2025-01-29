const {faker}=require('@faker-js/faker');
const mysql=require('mysql2');
const express=require('express');
const app=express();
const path=require('path');
const methodOverride=require('method-override');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

let getRandomUser=()=>{
    return[
        faker.number.int(),
       faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'delta_app',
    password:'At12345',
});



//Home page route
app.get("/",(req,res)=>{
    let q="select count(*) from user";
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let ans=result[0]["count(*)"]
        console.log(ans);
        res.render("home.ejs",{ans});
    });
  }catch(err){
    console.log(err);
    res.send("Some error occured");
    }
    // no need to write connection.end() beacuse the connection is automatically ended when this function is executed
});

//Show Route
app.get("/user",(req,res)=>{
    let q="SELECT * FROM USER";
    try{
        connection.query(q,(err,users)=>{
            res.render("show_users.ejs",{users});
        });
      }catch(err){
        console.log(err);
        res.send("Some error occured");
        }
});
//Edit Route
app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            console.log(user);
            res.render("edit.ejs",{user});
        });
      }catch(err){
        console.log(err);
        res.send("Some error occured");
        }
});

//Update Route
app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password:fromPass,username:newUsername}=req.body;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            if (fromPass!=user.password) {
                res.send("Wrong Password");
            }
            else{
                let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/user");
                    window.alert("User name changed");
                });
            }
        });
      }catch(err){
        console.log(err);
        res.send("Some error occured");
        }
});

app.get("/user/add",(req,res)=>{
    res.render("add_user.ejs");
});

app.post("/user",(req,res)=>{
    const { password: fromPass, username: newUsername, email: newMail } = req.body;
    let id2=faker.number.int();
    let q=`INSERT INTO user (username,email,password,id) VALUES
    ('${newUsername}','${newMail}','${fromPass}','${id2}')`;
    connection.query(q,(err,result)=>{
        if(err) throw err;
        console.log(result);
    });
    res.redirect("/");
    window.alert("User Added");
});

app.get("/user/:id/delete",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            res.render("delete.ejs",{user});
        });
    } catch (err) {
        console.log(err);
        res.send("Some error occured");
    }
});

app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password:fromPass,username:newUsername}=req.body;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            if(fromPass!=user.password){
                res.send("Wrong Password try again");
            }
            else{
                let q2=`DELETE FROM user WHERE id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/user");
                    window.alert("User Deleted");
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send("Some error occured");
    }
});

app.listen("8080",()=>{
    console.log("Server is running on port 8080");
});
