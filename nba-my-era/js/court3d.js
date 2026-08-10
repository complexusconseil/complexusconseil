/* ==========================================================================
   NBA My Era — Rendu 3D du match (Three.js). Stylisé, pas photoréaliste.
   Court3D.play(container, homeMeta, awayMeta, res, {onScore, onDone, speed})
   ========================================================================== */
(function () {
  const T = window.THREE;
  if (!T) { window.Court3D = { play() { return { skip() {}, stop() {} }; } }; return; }

  // Texture du parquet + lignes du terrain
  function courtTexture(c1) {
    const cv = document.createElement('canvas'); cv.width = 1120; cv.height = 600;
    const g = cv.getContext('2d');
    // parquet
    const grd = g.createLinearGradient(0, 0, 0, 600); grd.addColorStop(0, '#c8934f'); grd.addColorStop(1, '#b07d3e');
    g.fillStyle = grd; g.fillRect(0, 0, 1120, 600);
    for (let x = 0; x < 1120; x += 18) { g.strokeStyle = 'rgba(120,80,30,.18)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 600); g.stroke(); }
    g.strokeStyle = '#fff'; g.lineWidth = 4;
    g.strokeRect(30, 30, 1060, 540);
    // ligne médiane + rond central
    g.beginPath(); g.moveTo(560, 30); g.lineTo(560, 570); g.stroke();
    g.beginPath(); g.arc(560, 300, 70, 0, Math.PI * 2); g.stroke();
    // raquettes + arcs à 3pts (deux côtés)
    [[30, 1], [1090, -1]].forEach(([bx, dir]) => {
      g.strokeRect(bx + (dir > 0 ? 0 : -190), 205, 190, 190);
      g.beginPath(); g.arc(bx + dir * 60, 300, 60, -Math.PI / 2, Math.PI / 2, dir < 0); g.stroke();
      g.beginPath();
      g.arc(bx + dir * 20, 300, 250, dir > 0 ? -Math.PI / 2.4 : Math.PI / 2.4, dir > 0 ? Math.PI / 2.4 : -Math.PI / 2.4, dir < 0);
      g.stroke();
    });
    const tex = new T.CanvasTexture(cv); tex.anisotropy = 4; return tex;
  }

  function makePlayer(jersey) {
    const grp = new T.Group();
    const body = new T.Mesh(new T.CylinderGeometry(0.26, 0.34, 1.05, 12),
      new T.MeshStandardMaterial({ color: jersey, roughness: .8 }));
    body.position.y = 0.72; body.castShadow = true; grp.add(body);
    const legs = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.5, 8),
      new T.MeshStandardMaterial({ color: 0x222633 })); legs.position.y = 0.25; grp.add(legs);
    const head = new T.Mesh(new T.SphereGeometry(0.2, 16, 16),
      new T.MeshStandardMaterial({ color: 0xd8a878, roughness: .9 }));
    head.position.y = 1.45; head.castShadow = true; grp.add(head);
    grp.userData.pos = new T.Vector2(0, 0); grp.userData.target = new T.Vector2(0, 0);
    return grp;
  }

  function makeHoop(x, dir) {
    const grp = new T.Group();
    const white = new T.MeshStandardMaterial({ color: 0xffffff });
    const pole = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 3.1, 10), new T.MeshStandardMaterial({ color: 0x333333 }));
    pole.position.set(x + dir * 0.9, 1.55, 0); grp.add(pole);
    const board = new T.Mesh(new T.BoxGeometry(0.08, 1.05, 1.8), white);
    board.position.set(x, 3.0, 0); grp.add(board);
    const rim = new T.Mesh(new T.TorusGeometry(0.23, 0.03, 8, 20), new T.MeshStandardMaterial({ color: 0xe8642a }));
    rim.rotation.x = Math.PI / 2; rim.position.set(x - dir * 0.28, 2.75, 0); grp.add(rim);
    const net = new T.Mesh(new T.CylinderGeometry(0.22, 0.13, 0.4, 12, 1, true),
      new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .5 }));
    net.position.set(x - dir * 0.28, 2.55, 0); grp.add(net);
    grp.userData.rim = new T.Vector3(x - dir * 0.28, 2.75, 0);
    return grp;
  }

  window.Court3D = {
    play(container, homeMeta, awayMeta, res, opts) {
      opts = opts || {};
      const W = () => container.clientWidth || 800, H = () => container.clientHeight || 460;
      const scene = new T.Scene();
      scene.background = new T.Color(0x0b0e14);
      const camera = new T.PerspectiveCamera(45, W() / H(), 0.1, 200);
      const renderer = new T.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(W(), H()); renderer.shadowMap.enabled = true;
      container.innerHTML = ''; container.appendChild(renderer.domElement);

      // lumières
      scene.add(new T.HemisphereLight(0xffffff, 0x334455, 0.9));
      const dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(6, 14, 8); dl.castShadow = true;
      dl.shadow.mapSize.set(1024, 1024); dl.shadow.camera.near = 1; dl.shadow.camera.far = 60;
      dl.shadow.camera.left = -20; dl.shadow.camera.right = 20; dl.shadow.camera.top = 14; dl.shadow.camera.bottom = -14;
      scene.add(dl);

      // terrain
      const floor = new T.Mesh(new T.PlaneGeometry(28, 15), new T.MeshStandardMaterial({ map: courtTexture(homeMeta.c1), roughness: .95 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
      scene.add(makeHoop(13.5, 1)); const hoopA = { x: 12.4 }; // home attaque +x
      scene.add(makeHoop(-13.5, -1)); const hoopB = { x: -12.4 };
      const rimPos = [new T.Vector3(12.4, 2.75, 0), new T.Vector3(-12.4, 2.75, 0)];

      // joueurs (0-4 home, 5-9 away)
      const players = [];
      for (let i = 0; i < 10; i++) { const p = makePlayer(i < 5 ? homeMeta.c1 : awayMeta.c1); scene.add(p); players.push(p); }
      function scatter(offenseTeam) {
        const sign = offenseTeam === 0 ? 1 : -1;   // sens d'attaque
        players.forEach((p, i) => {
          const off = (i < 5) === (offenseTeam === 0);
          const bx = off ? sign * (4 + Math.random() * 8) : sign * (2 + Math.random() * 7);
          const bz = (Math.random() - 0.5) * 11;
          p.userData.target.set(bx, bz);
        });
      }
      scatter(0);

      // ballon
      const ball = new T.Mesh(new T.SphereGeometry(0.14, 16, 16), new T.MeshStandardMaterial({ color: 0xe8642a, roughness: .7 }));
      ball.castShadow = true; scene.add(ball);
      const ballPos = new T.Vector3(0, 1, 0);

      // caméra orbitale (drag + molette)
      let theta = -0.5, phi = 0.9, radius = 26;
      function updateCam() {
        camera.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta));
        camera.lookAt(0, 1.5, 0);
      }
      updateCam();
      let dragging = false, lx = 0, ly = 0;
      const dom = renderer.domElement;
      dom.style.cursor = 'grab';
      dom.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; dom.style.cursor = 'grabbing'; });
      window.addEventListener('pointerup', () => { dragging = false; dom.style.cursor = 'grab'; });
      window.addEventListener('pointermove', e => { if (!dragging) return; theta -= (e.clientX - lx) * 0.006; phi = Math.max(0.35, Math.min(1.35, phi - (e.clientY - ly) * 0.005)); lx = e.clientX; ly = e.clientY; updateCam(); });
      dom.addEventListener('wheel', e => { e.preventDefault(); radius = Math.max(14, Math.min(40, radius + e.deltaY * 0.02)); updateCam(); }, { passive: false });

      // état du match
      const targetH = res.home.score, targetA = res.away.score;
      let hScore = 0, aScore = 0;
      const speed = opts.speed || 1;
      const showDuration = 42 / speed;   // secondes
      let elapsed = 0, done = false, finished = false;
      let possT = 0, possDur = 0.8, offense = 0, shooter = null, shotT = -1, shotMake = false, shotFrom = new T.Vector3(), lastScore = 0;

      function newPossession() {
        offense = 1 - offense;
        scatter(offense);
        const idxs = players.map((p, i) => i).filter(i => (i < 5) === (offense === 0));
        shooter = players[idxs[Math.floor(Math.random() * idxs.length)]];
        possT = 0; shotT = -1;
      }
      newPossession();

      function onResize() { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }
      window.addEventListener('resize', onResize);

      const clock = new T.Clock();
      let raf;
      function frame() {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, clock.getDelta());
        if (!finished) elapsed += dt;
        // progression du score (courbe douce) vers le score final
        const prog = Math.min(1, elapsed / showDuration);
        const ease = prog * prog * (3 - 2 * prog);
        const desiredH = finished ? targetH : Math.round(targetH * ease);
        const desiredA = finished ? targetA : Math.round(targetA * ease);

        // déplacement joueurs
        players.forEach(p => {
          const tp = p.userData.target;
          p.position.x += (tp.x - p.position.x) * Math.min(1, dt * 4);
          p.position.z += (tp.y - p.position.z) * Math.min(1, dt * 4);
        });

        // logique de possession
        possT += dt;
        const rim = rimPos[offense];
        if (shotT < 0 && possT > possDur * 0.55) {
          // déclenche le tir
          shotT = 0; shotFrom.copy(shooter.position); shotFrom.y = 1.4;
          shotMake = (offense === 0 ? desiredH > hScore : desiredA > aScore);
        }
        if (shotT < 0) {
          // avant le tir : le ballon suit le tireur (dribble/passe)
          ballPos.lerp(new T.Vector3(shooter.position.x, 1.1 + Math.sin(possT * 12) * 0.15, shooter.position.z), Math.min(1, dt * 6));
        } else {
          shotT += dt;
          const st = Math.min(1, shotT / 0.55);
          const p0 = shotFrom, p1 = rim;
          ballPos.x = p0.x + (p1.x - p0.x) * st;
          ballPos.z = p0.z + (p1.z - p0.z) * st;
          const arc = 2.6 * Math.sin(Math.PI * st);
          ballPos.y = p0.y + (p1.y - p0.y) * st + arc;
          if (st >= 1) {
            if (shotMake) { if (offense === 0) hScore++; else aScore++; if (opts.onScore) opts.onScore(hScore, aScore); }
            else { ballPos.add(new T.Vector3((Math.random() - 0.5) * 2, -0.5, (Math.random() - 0.5) * 2)); }
            newPossession();
          }
        }
        ball.position.copy(ballPos);

        // fin de match
        if (!finished && prog >= 1 && hScore >= targetH && aScore >= targetA) { finished = true; if (opts.onDone) opts.onDone(); }
        renderer.render(scene, camera);
      }
      frame();

      return {
        skip() { finished = true; hScore = targetH; aScore = targetA; if (opts.onScore) opts.onScore(hScore, aScore); if (opts.onDone) opts.onDone(); },
        stop() { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); renderer.dispose(); container.innerHTML = ''; },
      };
    },
  };
})();
