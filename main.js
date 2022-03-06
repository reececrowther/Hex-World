

import * as THREE from 'https://cdn.skypack.dev/three@0.125.0/build/three.module.js?min';
import randomFloat from '//reececrowther.github.io/Hex-World/random-float/index.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.125.0/examples/jsm/loaders/GLTFLoader.js?min';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.125.0/examples/jsm/postprocessing/EffectComposer.js?min';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.125.0/examples/jsm/postprocessing/RenderPass.js?min';




//scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1 , 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

//post processing
const composer = new EffectComposer( renderer );
var renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
//renderPass.renderToScreen = true;





renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(20);
camera.position.setY(17);
camera.rotation.y = 0;  
camera.rotation.x = -0.7;  
camera.rotation.z = 0;


//resizing 
window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
  
        renderer.setSize( window.innerWidth, window.innerHeight );
  
}

let hexagon = new THREE.Object3D;





///////////////////////////////////////hexGrid
class Tile extends THREE.Object3D {
  constructor(radius = 1, anim = false) {
    super();

        
    let height = randomFloat(0.05, 2);
    let geometry = new THREE.CylinderGeometry(radius * .8, radius * .8, height, 6);
    let tileColor = this.colorOnHeight(height);
    let material = new THREE.MeshLambertMaterial({ color: tileColor});
    material.flatShading = false;
    let mesh = new THREE.Mesh(geometry,  material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    hexagon = this.add(mesh);
    mesh.translateY(5);
    return this;
    
  };

 

  colorOnHeight(height) {
     let ground = 0x008000;
     let sand = 0xA59C59;
     let stone = 0x595959;

      if(height > 0 &&  height < 0.5){
       return sand;
      }
      if(height > 0.5 &&  height < 1.5){
        return ground;
      }
      if(height > 1.5 &&  height < 2){
      return stone;
      }
  };

  
};


document.addEventListener('mousemove', mousemove, false);

var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(1, 1);
    var intersects = [];

    function mousemove(event){
    	event.preventDefault();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }




class Board extends THREE.Object3D {
  constructor(countU, countV) {
    super();
    
    let radius = 1;
    this.grid = new Array();
    
    for(var u = (-countU / 2); u < (countU / 2); u++) {
      this.grid[u] = this.grid[u] || new Array();
      for(var v = (-countV / 2); v < (countV / 2); v++) {
        let hex = new Tile(radius);
        let box = new THREE.Box3().setFromObject(hex);
        let hexW = box.max.x - box.min.x;
        let hexH = box.max.z - box.min.z;
        let hexX = u * hexW;
        let hexZ = v * hexH * .75;
        if(Math.abs(v % 2) == 1) hexX = hexX + (hexW / 2);
        hex.position.set(hexX, 0, hexZ);
        this.grid[u][v] = this.grid[u][v] || new Array();
        this.grid[u][v] = hex;
        this.add(hex);
      };
    };
    
    console.log(this.grid);
  };
  
  fromCube(cube) {
    let u = cube.x + (cube.z + Math.abs(cube.z % 2)) / 2;
    let v = cube.z;
    return new THREE.Vector2(u, v);
  };
  
  toCube() {
    let x = this.u - (this.v + Math.abs(this.v % 2)) / 2;
    let z = this.v;
    let y = -x-z;
    return new THREE.Vector3(x, y, z);
  };
};


let board = new Board(20,20);
scene.add(board);





//lighting 
const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(15,15,5)

const ambientLight = new THREE.AmbientLight(0xffffff)
ambientLight.position.set(0,0,0)

scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight)
//scene.add(lightHelper);

//background
const sceneBG = new THREE.TextureLoader().load('//reececrowther.github.io/Hex-World/Images/blue-sky-gradient.jpg');
scene.background = sceneBG;


//hex fall
let newHexes = [];
setInterval (function resetHexs(){

  for ( var i = 0; i < newHexes.length; i++ ){
    
    if(newHexes[i].object.position.y > 4.9){
      newHexes[i].object.translateY(-.01);
      
  }
  }
  
}, 50);

function smoothPop(hex){
    hex.object.translateY(-.1);
}


function animate(){
  requestAnimationFrame(animate);


  board.rotation.y += 0.005;
  
  //move hexes
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );

  for ( var i = 0; i < intersects.length; i++ )
  {

      if(intersects[ i ].object.position.y < 6){
        intersects[ i ].object.translateY(.6);
        newHexes.push(intersects[ i ]);
        smoothPop(intersects[ i ]);
      }
  }

  //renderer.render(scene, camera);
  composer.render();
}


animate();



  
