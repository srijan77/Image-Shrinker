const{app,BrowserWindow,Menu,globalShortcut,ipcMain,shell}=require("electron")
//app is used for optimising the app and BrowserWindow is used to make the window of the applicatipon
const path=require('path')
const os=require('os')
const imagemin=require('imagemin')
const imageminMozjpeg=require('imagemin-mozjpeg')
const imageminPngquant=require('imagemin-pngquant')
const slash=require('slash')
const log=require('electron-log')


// making it a development enviroment fro now but finnaly make it production
process.env.NODE_ENV='production'

// console.log(process.env.NODE_ENV)
// console.log(process.platform)

const isDev=process.env.NODE_ENV!=='production'?true:false
const isMac=process.platform==='darwin'?true:false;
// for the main window
let mainWindow
function createMainWindow(){
   mainWindow = new BrowserWindow({
  title:"Image Optimizer",
  width:isDev?800:700,
  height:600,
  icon:`${__dirname}/assets/icons/Icon_256x256.png`,
  resizable:isDev,
  backgroundColor:'white',
  webPreferences:{nodeIntegration:true}// this line is used so that we can efine path in index.html

    

  })
    //open dev tools automatically
if(isDev){
  mainWindow.webContents.openDevTools()
}
  // mainWindow.loadURL(`file://${__dirname}/app/index.html`); this line is same as below
  mainWindow.loadFile("./app/index.html")

}

// for the about window
let aboutWindow
function createAboutWindow(){
   aboutWindow = new BrowserWindow({
  title:"Image Optimizer",
  width:500,
  height:300,
  icon:`${__dirname}/assets/icons/Icon_256x256.png`,
  resizable:false,
  backgroundColor:'white',


   })
  // mainWindow.loadURL(`file://${__dirname}/app/index.html`); this line is same as below
  aboutWindow.loadFile("./app/about.html")

  

}

app.on('ready',()=>{
  createMainWindow()
  const mainMenu=Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
  // globalShortcut.register('CmdOrCtrl+R',()=>mainWindow.reload())
  // globalShortcut.register(isMac?'Command+Alt+I':'Ctrl+Shift+I',()=>mainWindow.toggleDevTools())

  mainWindow.on('closed',()=>mainWindow=null)
})

const menu=[
  // ...(isMac?[{role:'appMenu'}]:[]),
  // {
  //   label:'File',
  //   submenu:[
  //     {
  //       label:'Quit',
  //       accelerator:isMac?'Command+W':'Ctrl+W',//accelerator :'CtrlOrCmd+W'
  //       click:()=>app.quit()
  //     }
  //   ]
  // }

  {role:'fileMenu'},

...(isMac?[{
  label:app.name,
  submenu:[
    {
      label:'About',
      click:createAboutWindow,
    }
  ]
}]:[]),

...(!isMac?[{
  label:'Help',
  submenu:[{
    label:'About',
    click:createAboutWindow,
  }]
}]:[]),




  

  ...(isDev?[
    {
      label:'Developer',
      submenu:[{role:'reload'},
               {role:'forcereload'},
               {type:'separator'},
               {role:'toggledevtools'}]
    }
  ]:[])

  
]


ipcMain.on('image:minimizer',(e,options)=>{
  options.dest=path.join(os.homedir(),'imageshrink')
  shrinkImage(options)
  // console.log(options)
})

async function shrinkImage({imgPath,quality,dest}){
   try {
     const pngQuality=quality/100
     const files=await imagemin([slash(imgPath)],{
       destination:dest,
       plugins:[
         imageminMozjpeg({quality}),
         imageminPngquant({
           quality:[pngQuality,pngQuality]
         })
       ]
     })
    //  console.log(files)
    log.info(files)
     shell.openPath(dest);

mainWindow.webContents.send('image:done')

   } catch (err) {
    //  console.log(err)
    log.error(err)
   }
}




















// check the below functionality on docs
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

// check the below functionality on docs

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})