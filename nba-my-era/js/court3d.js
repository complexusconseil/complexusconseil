/* ==========================================================================
   NBA My Era — Rendu 3D du match (Three.js). Stylisé (arène, maillots
   numérotés, ralenti sur les paniers). Court3D.play(container, home, away, res, opts)
   ========================================================================== */
(function () {
  const T = window.THREE;
  if (!T) { window.Court3D = { play() { return { skip() {}, stop() {} }; } }; return; }

  function courtTexture() {
    const cv = document.createElement('canvas'); cv.width = 1120; cv.height = 600;
    const g = cv.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 600); grd.addColorStop(0, '#c99a56'); grd.addColorStop(1, '#b07d3e');
    g.fillStyle = grd; g.fillRect(0, 0, 1120, 600);
    for (let x = 0; x < 1120; x += 16) { g.strokeStyle = 'rgba(120,80,30,.16)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 600); g.stroke(); }
    g.strokeStyle = '#fff'; g.lineWidth = 5; g.strokeRect(30, 30, 1060, 540);
    g.beginPath(); g.moveTo(560, 30); g.lineTo(560, 570); g.stroke();
    g.beginPath(); g.arc(560, 300, 70, 0, Math.PI * 2); g.stroke();
    [[30, 1], [1090, -1]].forEach(([bx, dir]) => {
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeRect(bx + (dir > 0 ? 0 : -190), 205, 190, 190);
      g.beginPath(); g.arc(bx + dir * 60, 300, 60, -Math.PI / 2, Math.PI / 2, dir < 0); g.stroke();
      g.lineWidth = 5; g.beginPath();
      g.arc(bx + dir * 20, 300, 250, dir > 0 ? -Math.PI / 2.4 : Math.PI / 2.4, dir > 0 ? Math.PI / 2.4 : -Math.PI / 2.4, dir < 0);
      g.stroke();
    });
    const tex = new T.CanvasTexture(cv); tex.anisotropy = 8; return tex;
  }

  // Sprite texte (numéros, pop-ups)
  function textSprite(text, color, bg) {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
    const g = cv.getContext('2d');
    if (bg) { g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill(); g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(); }
    g.fillStyle = color; g.font = 'bold 74px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 64, 70);
    const tex = new T.CanvasTexture(cv);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true }));
    return sp;
  }

  function makePlayer(jersey, number) {
    const grp = new T.Group();
    const jerseyMat = new T.MeshStandardMaterial({ color: jersey, roughness: .75, metalness: .05 });
    const body = new T.Mesh(new T.CylinderGeometry(0.26, 0.34, 1.02, 14), jerseyMat);
    body.position.y = 0.74; body.castShadow = true; grp.add(body);
    const legs = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.52, 8), new T.MeshStandardMaterial({ color: 0x1b1f2a }));
    legs.position.y = 0.26; legs.castShadow = true; grp.add(legs);
    const head = new T.Mesh(new T.SphereGeometry(0.2, 18, 18), new T.MeshStandardMaterial({ color: 0xd8a878, roughness: .9 }));
    head.position.y = 1.46; head.castShadow = true; grp.add(head);
    const num = textSprite(String(number), '#ffffff', null);
    num.scale.set(0.5, 0.5, 0.5); num.position.set(0, 0.95, 0.0); grp.add(num);
    grp.userData.target = new T.Vector2(0, 0);
    return grp;
  }

  function makeHoop(x, dir) {
    const grp = new T.Group();
    const white = new T.MeshStandardMaterial({ color: 0xffffff });
    const pole = new T.Mesh(new T.CylinderGeometry(0.11, 0.13, 3.2, 12), new T.MeshStandardMaterial({ color: 0x2a2f3a }));
    pole.position.set(x + dir * 0.95, 1.6, 0); pole.castShadow = true; grp.add(pole);
    const board = new T.Mesh(new T.BoxGeometry(0.08, 1.05, 1.85), white);
    board.position.set(x, 3.05, 0); board.castShadow = true; grp.add(board);
    const sq = new T.Mesh(new T.PlaneGeometry(0.6, 0.45), new T.MeshBasicMaterial({ color: 0xe8642a, side: T.DoubleSide }));
    sq.position.set(x + dir * 0.05, 2.95, 0); sq.rotation.y = Math.PI / 2; grp.add(sq);
    const rimMat = new T.MeshStandardMaterial({ color: 0xe8642a, emissive: 0x000000 });
    const rim = new T.Mesh(new T.TorusGeometry(0.23, 0.03, 8, 22), rimMat);
    rim.rotation.x = Math.PI / 2; rim.position.set(x - dir * 0.28, 2.78, 0); grp.add(rim);
    const netMat = new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .5 });
    const net = new T.Mesh(new T.CylinderGeometry(0.22, 0.12, 0.42, 12, 2, true), netMat);
    net.position.set(x - dir * 0.28, 2.56, 0); grp.add(net);
    grp.userData.rim = new T.Vector3(x - dir * 0.28, 2.78, 0);
    grp.userData.net = netMat; grp.userData.rimMat = rimMat;
    return grp;
  }

  function arena() {
    const g = new T.Group();
    // sol foncé autour du terrain
    const base = new T.Mesh(new T.PlaneGeometry(70, 46), new T.MeshStandardMaterial({ color: 0x0c0f16 }));
    base.rotation.x = -Math.PI / 2; base.position.y = -0.02; base.receiveShadow = true; g.add(base);
    // gradins : anneau de blocs sombres avec liserés colorés
    const seatMat = new T.MeshStandardMaterial({ color: 0x161b26 });
    const glow = [0x3b82f6, 0xf0a500, 0x2ecc71];
    for (let ring = 0; ring < 3; ring++) {
      const y = 1.2 + ring * 1.1, ext = 18 + ring * 2.2;
      const m = new T.Mesh(new T.BoxGeometry(2 * ext + 8, 0.9, 0.4), new T.MeshStandardMaterial({ color: glow[ring], emissive: glow[ring], emissiveIntensity: 0.25 }));
      [[0, ext + 3], [0, -ext - 3]].forEach(([, z]) => { const s = m.clone(); s.position.set(0, y, z); g.add(s); });
      const side = new T.Mesh(new T.BoxGeometry(0.4, 0.9, 2 * (ext + 3)), new T.MeshStandardMaterial({ color: glow[ring], emissive: glow[ring], emissiveIntensity: 0.25 }));
      [[ext + 6, 0], [-ext - 6, 0]].forEach(([xx]) => { const s = side.clone(); s.position.set(xx, y, 0); g.add(s); });
      // masse des gradins
      const blkZ = new T.Mesh(new T.BoxGeometry(2 * ext + 10, 1.0, 1.0), seatMat);
      [[0, ext + 4], [0, -ext - 4]].forEach(([, z]) => { const s = blkZ.clone(); s.position.set(0, y - 0.05, z + (z > 0 ? 0.6 : -0.6)); g.add(s); });
    }
    return g;
  }

  window.Court3D = {
    play(container, homeMeta, awayMeta, res, opts) {
      opts = opts || {};
      const W = () => container.clientWidth || 800, H = () => container.clientHeight || 460;
      const scene = new T.Scene();
      scene.background = new T.Color(0x05070c);
      scene.fog = new T.Fog(0x05070c, 34, 62);
      const camera = new T.PerspectiveCamera(45, W() / H(), 0.1, 200);
      const renderer = new T.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(W(), H()); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
      container.innerHTML = ''; container.appendChild(renderer.domElement);

      // lumières d'arène
      scene.add(new T.HemisphereLight(0xbcd3ff, 0x1a2030, 0.75));
      const key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(8, 18, 10); key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 1; key.shadow.camera.far = 70;
      key.shadow.camera.left = -22; key.shadow.camera.right = 22; key.shadow.camera.top = 16; key.shadow.camera.bottom = -16;
      scene.add(key);
      [[8, 12, 0], [-8, 12, 0]].forEach(p => { const sp = new T.SpotLight(0xffffff, 0.6, 60, Math.PI / 4, 0.5); sp.position.set(p[0], p[1], p[2]); sp.target.position.set(p[0] * 0.6, 0, 0); scene.add(sp); scene.add(sp.target); });

      scene.add(arena());
      const floor = new T.Mesh(new T.PlaneGeometry(28, 15), new T.MeshStandardMaterial({ map: courtTexture(), roughness: .9 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
      const hoopH = makeHoop(13.5, 1); scene.add(hoopH);
      const hoopA = makeHoop(-13.5, -1); scene.add(hoopA);
      const hoops = [hoopH, hoopA];
      const rimPos = [hoopH.userData.rim, hoopA.userData.rim];

      const players = [];
      for (let i = 0; i < 10; i++) { const p = makePlayer(i < 5 ? homeMeta.c1 : awayMeta.c1, (i % 5) * 2 + 3 + (i < 5 ? 0 : 20)); scene.add(p); players.push(p); }
      function scatter(offense) {
        const sign = offense === 0 ? 1 : -1;
        players.forEach((p, i) => {
          const off = (i < 5) === (offense === 0);
          const bx = off ? sign * (4 + Math.random() * 8) : sign * (2 + Math.random() * 7);
          p.userData.target.set(bx, (Math.random() - 0.5) * 11);
        });
      }
      scatter(0);

      const ball = new T.Mesh(new T.SphereGeometry(0.14, 18, 18), new T.MeshStandardMaterial({ color: 0xe8642a, roughness: .6 }));
      ball.castShadow = true; scene.add(ball);
      const ballShadow = new T.Mesh(new T.CircleGeometry(0.16, 16), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .25 }));
      ballShadow.rotation.x = -Math.PI / 2; ballShadow.position.y = 0.02; scene.add(ballShadow);
      const ballPos = new T.Vector3(0, 1, 0);

      // caméra orbitale
      let theta = -0.5, phi = 0.92, radius = 26;
      function updateCam() { camera.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta)); camera.lookAt(0, 1.6, 0); }
      updateCam();
      let dragging = false, lx = 0, ly = 0; const dom = renderer.domElement; dom.style.cursor = 'grab';
      dom.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; dom.style.cursor = 'grabbing'; });
      window.addEventListener('pointerup', () => { dragging = false; dom.style.cursor = 'grab'; });
      window.addEventListener('pointermove', e => { if (!dragging) return; theta -= (e.clientX - lx) * 0.006; phi = Math.max(0.35, Math.min(1.35, phi - (e.clientY - ly) * 0.005)); lx = e.clientX; ly = e.clientY; updateCam(); });
      dom.addEventListener('wheel', e => { e.preventDefault(); radius = Math.max(14, Math.min(42, radius + e.deltaY * 0.02)); updateCam(); }, { passive: false });

      // pop-ups
      const popups = [];
      function popup(text, at, color) { const s = textSprite(text, color); s.scale.set(1.4, 1.4, 1.4); s.position.copy(at); s.position.y += 0.6; scene.add(s); popups.push({ s, t: 0, ttl: 1.1 }); }

      const targetH = res.home.score, targetA = res.away.score;
      let hScore = 0, aScore = 0;
      const showDuration = 42 / (opts.speed || 1);
      let elapsed = 0, finished = false;
      let possT = 0, possDur = 0.85, offense = 0, shooter = null, shotT = -1, shotFrom = new T.Vector3(), shotMake = false, shotIs3 = false;
      let slow = 1; // facteur de ralenti
      let flash = [0, 0];

      function newPossession() { offense = 1 - offense; scatter(offense); const idxs = players.map((p, i) => i).filter(i => (i < 5) === (offense === 0)); shooter = players[idxs[(Math.random() * idxs.length) | 0]]; possT = 0; shotT = -1; }
      newPossession();

      function onResize() { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }
      window.addEventListener('resize', onResize);

      const clock = new T.Clock(); let raf;
      function frame() {
        raf = requestAnimationFrame(frame);
        let dt = Math.min(0.05, clock.getDelta());
        // ralenti
        slow += ((1) - slow) * Math.min(1, dt * 2);
        const sdt = dt * slow;
        if (!finished) elapsed += dt;

        const prog = Math.min(1, elapsed / showDuration);
        const ease = prog * prog * (3 - 2 * prog);
        const desiredH = finished ? targetH : Math.round(targetH * ease);
        const desiredA = finished ? targetA : Math.round(targetA * ease);

        players.forEach(p => { const tp = p.userData.target; p.position.x += (tp.x - p.position.x) * Math.min(1, sdt * 4); p.position.z += (tp.y - p.position.z) * Math.min(1, sdt * 4); });

        possT += sdt; const rim = rimPos[offense];
        if (shotT < 0 && possT > possDur * 0.55) {
          shotT = 0; shotFrom.copy(shooter.position); shotFrom.y = 1.5;
          const dx = shotFrom.x - rim.x, dz = shotFrom.z - rim.z; shotIs3 = Math.sqrt(dx * dx + dz * dz) > 7.2;
          shotMake = (offense === 0 ? desiredH > hScore : desiredA > aScore);
        }
        if (shotT < 0) {
          ballPos.lerp(new T.Vector3(shooter.position.x, 1.15 + Math.sin(possT * 12) * 0.14, shooter.position.z), Math.min(1, sdt * 6));
        } else {
          shotT += sdt; const st = Math.min(1, shotT / 0.6);
          ballPos.x = shotFrom.x + (rim.x - shotFrom.x) * st;
          ballPos.z = shotFrom.z + (rim.z - shotFrom.z) * st;
          ballPos.y = shotFrom.y + (rim.y - shotFrom.y) * st + 2.8 * Math.sin(Math.PI * st);
          if (st >= 1) {
            if (shotMake) {
              if (offense === 0) hScore++; else aScore++; if (opts.onScore) opts.onScore(hScore, aScore);
              slow = 0.32;                              // ralenti sur le panier
              flash[offense] = 1;                       // flash du filet
              popup(shotIs3 ? '+3' : '+2', rim, '#2ecc71');
            } else { ballPos.add(new T.Vector3((Math.random() - 0.5) * 2, -0.4, (Math.random() - 0.5) * 2)); }
            newPossession();
          }
        }
        ball.position.copy(ballPos);
        ballShadow.position.x = ballPos.x; ballShadow.position.z = ballPos.z;
        ballShadow.material.opacity = 0.28 * Math.max(0.2, 1 - (ballPos.y - 0.15) / 4);

        // flash des filets
        for (let k = 0; k < 2; k++) {
          if (flash[k] > 0) { flash[k] = Math.max(0, flash[k] - dt * 2); hoops[k].userData.net.opacity = 0.5 + flash[k] * 0.5; hoops[k].userData.rimMat.emissive.setRGB(flash[k], flash[k], 0); }
        }
        // pop-ups
        for (let i = popups.length - 1; i >= 0; i--) { const pu = popups[i]; pu.t += dt; pu.s.position.y += dt * 1.2; pu.s.material.opacity = Math.max(0, 1 - pu.t / pu.ttl); if (pu.t >= pu.ttl) { scene.remove(pu.s); popups.splice(i, 1); } }

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
