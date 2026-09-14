/* ---------- custom cursor ---------- */
  var dot = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  var mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
  window.addEventListener('mousemove', function(e){
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+'px'; dot.style.top=my+'px';
    document.documentElement.style.setProperty('--mx', mx+'px');
    document.documentElement.style.setProperty('--my', my+'px');
  });
  (function ringLoop(){
    rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(ringLoop);
  })();
  document.querySelectorAll('a, button, .tag, .tilt, .t-row, .dot-wrap').forEach(function(el){
    el.addEventListener('mouseenter', function(){ ring.classList.add('hover'); });
    el.addEventListener('mouseleave', function(){ ring.classList.remove('hover'); });
  });

  /* ---------- magnetic elements ---------- */
  document.querySelectorAll('.magnetic').forEach(function(el){
    el.style.transition='transform 0.2s ease';
    el.addEventListener('mousemove', function(e){
      var r=el.getBoundingClientRect();
      var relX=e.clientX-r.left-r.width/2;
      var relY=e.clientY-r.top-r.height/2;
      el.style.transform='translate('+(relX*0.35)+'px,'+(relY*0.45)+'px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform='translate(0,0)'; });
  });

  /* ---------- 3D tilt cards ---------- */
  document.querySelectorAll('.tilt').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r=el.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
      var rotY=(px-0.5)*16, rotX=(0.5-py)*16;
      el.style.transform='perspective(600px) rotateX('+rotX+'deg) rotateY('+rotY+'deg) scale(1.02)';
      var glow=el.querySelector('.p-glow');
      if(glow){ glow.style.left=(px*100)+'%'; glow.style.top=(py*100)+'%'; }
    });
    el.addEventListener('mouseleave', function(){ el.style.transform='perspective(600px) rotateX(0) rotateY(0) scale(1)'; });
  });

  /* ---------- splash split text ---------- */
  var word = "Nicolas Previato";
  var wrap = document.getElementById('splash-word');
  var letterSpans = [];
  word.split('').forEach(function(ch, i){
    var span=document.createElement('span');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.setProperty('--dir', (i % 2 === 0 ? -1 : 1));
    span.style.transitionDelay = (0.045*i)+'s';
    wrap.appendChild(span);
    letterSpans.push(span);
  });
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      letterSpans.forEach(function(s){ s.classList.add('show'); });
    });
  });
  window.addEventListener('load', function(){
    setTimeout(function(){ document.getElementById('splash').classList.add('hide'); }, 1900);
  });

  /* ---------- header + side nav state ---------- */
  var header=document.getElementById('site-header');
  var sections=['home','about','work','skills','certs','contact'];
  var navButtons=document.querySelectorAll('header nav button');
  var dotWraps=document.querySelectorAll('#side-nav .dot-wrap');
  function goTo(id){ var el=document.getElementById(id); if(el){ el.scrollIntoView({behavior:'smooth'}); } }
  navButtons.forEach(function(btn){ btn.addEventListener('click', function(){ goTo(btn.dataset.target); }); });
  dotWraps.forEach(function(dw){ dw.addEventListener('click', function(){ goTo(dw.dataset.target); }); });
  var sectionEls=sections.map(function(id){ return document.getElementById(id); });
  var navIo=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.id;
        navButtons.forEach(function(b){ b.classList.toggle('active', b.dataset.target===id); });
        dotWraps.forEach(function(d){ d.classList.toggle('active', d.dataset.target===id); });
      }
    });
  }, {threshold:0.5});
  sectionEls.forEach(function(el){ if(el) navIo.observe(el); });
  window.addEventListener('scroll', function(){
    header.classList.toggle('scrolled', window.scrollY>40);
  });

  /* ---------- reveal animations (GSAP) ---------- */
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.mask').forEach(function(m){
    ScrollTrigger.create({
      trigger:m, start:'top 90%',
      onEnter:function(){ m.classList.add('in'); }
    });
  });
  document.querySelectorAll('.fade').forEach(function(f){
    ScrollTrigger.create({
      trigger:f, start:'top 88%',
      onEnter:function(){ f.classList.add('in'); }
    });
  });
  // hero reveals immediately on load rather than waiting for scroll
  document.querySelectorAll('#home .mask, #home .fade').forEach(function(el){ el.classList.add('in'); });

  /* ---------- THREE.JS 3D BACKGROUND ---------- */
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 100);
  camera.position.z=9;
  var renderer=new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  document.getElementById('webgl-bg').appendChild(renderer.domElement);

  var group=new THREE.Group();
  scene.add(group);

  var icoGeo=new THREE.IcosahedronGeometry(3.2, 1);
  var icoMat=new THREE.MeshBasicMaterial({color:0xb6bac5, wireframe:true, transparent:true, opacity:0.14});
  var ico=new THREE.Mesh(icoGeo, icoMat);
  group.add(ico);

  var icoGeo2=new THREE.IcosahedronGeometry(1.6, 0);
  var icoMat2=new THREE.MeshBasicMaterial({color:0xb6bac5, wireframe:true, transparent:true, opacity:0.10});
  var ico2=new THREE.Mesh(icoGeo2, icoMat2);
  group.add(ico2);

  var particleCount=260;
  var positions=new Float32Array(particleCount*3);
  for(var i=0;i<particleCount;i++){
    var r=6+Math.random()*6;
    var theta=Math.random()*Math.PI*2;
    var phi=Math.acos((Math.random()*2)-1);
    positions[i*3]=r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
    positions[i*3+2]=r*Math.cos(phi);
  }
  var pGeo=new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  var pMat=new THREE.PointsMaterial({color:0x8a8a84, size:0.045, transparent:true, opacity:0.55});
  var points=new THREE.Points(pGeo, pMat);
  scene.add(points);

  var mouseX=0, mouseY=0, targetRotX=0, targetRotY=0;
  window.addEventListener('mousemove', function(e){
    mouseX=(e.clientX/innerWidth)*2-1;
    mouseY=(e.clientY/innerHeight)*2-1;
  });
  window.addEventListener('resize', function(){
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  var scrollRot=0;
  window.addEventListener('scroll', function(){
    var maxScroll=document.body.scrollHeight-innerHeight;
    scrollRot=(window.scrollY/maxScroll)*Math.PI*1.4;
    var t=window.scrollY/maxScroll;
    camera.position.z=9-t*3;
  });

  function animate(){
    requestAnimationFrame(animate);
    targetRotX += (mouseY*0.4 - targetRotX)*0.04;
    targetRotY += (mouseX*0.5 - targetRotY)*0.04;
    group.rotation.x = targetRotX + scrollRot*0.3;
    group.rotation.y = targetRotY + scrollRot*0.6;
    ico.rotation.z += 0.0015;
    ico2.rotation.x -= 0.0022;
    points.rotation.y += 0.0006;
    points.rotation.x = targetRotX*0.5;
    renderer.render(scene, camera);
  }
  animate();