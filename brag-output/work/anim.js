// Cada quadro e funcao pura do tempo: render(t) posiciona tudo a partir de t (segundos).
(() => {
  const F = window.FRAG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const p = (t, a, b) => clamp((t - a) / (b - a));
  const outCubic = (x) => 1 - (1 - x) ** 3;
  const inCubic = (x) => x ** 3;
  const inOutCubic = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
  const outBack = (x) => {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
  };
  const lerp = (a, b, x) => a + (b - a) * x;

  const frag = (nome) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = F[nome].replaceAll('src="/marca.svg"', 'src="marca.svg"');
    return tpl.content;
  };

  // ---------- montagem ----------
  // 1
  $('#carimbo1zoom').append(frag('seloVerificado'));
  const RESPOSTA = '— acho que sim…';

  // 2: cabecalho e heroi exatamente como o site renderiza
  const layout = frag('layout');
  const header = layout.querySelector('header');
  header.classList.remove('sticky');
  $('#s2header').append(header);
  const home = frag('home');
  const heroi = home.querySelector('section');
  $('#s2hero').append(heroi);
  const calcadaHeader = header.querySelector('.calcada');
  const heroTexto = heroi.children[0];
  const [olho, h1, paragrafo, botoes] = heroTexto.children;
  // titulo palavra a palavra, sem mudar a quebra de linha do site
  const palavras = [];
  for (const no of [...h1.childNodes]) {
    if (no.nodeType === 3) {
      const partes = no.textContent.split(/(\s+)/);
      const frag2 = document.createDocumentFragment();
      for (const parte of partes) {
        if (!parte) continue;
        if (/^\s+$/.test(parte)) frag2.append(parte);
        else {
          const s = document.createElement('span');
          s.className = 'palavra';
          s.textContent = parte;
          palavras.push(s);
          frag2.append(s);
        }
      }
      no.replaceWith(frag2);
    } else {
      no.classList.add('palavra');
      palavras.push(no);
    }
  }
  const portal = heroi.querySelector('figure');
  const fila = portal.children[0];
  const [torreE, vaoE, pilarE, arco, pilarD, vaoD, torreD] = fila.children;
  const baseBarra = portal.children[1];
  const legendaPortal = portal.children[2];
  const pinhoes = $$('.pinhao', arco);
  const gradeArco = $('.grade-creme', arco);

  // 3
  for (const el of $$('[data-frag]')) el.append(frag(el.dataset.frag));
  const s3linhas = $$('.s3linha');
  const s3palavras = (() => {
    const h = $('#s3titulo');
    const ws = h.textContent.split(' ');
    h.textContent = '';
    return ws.map((w, i) => {
      const s = document.createElement('span');
      s.className = 'palavra';
      s.textContent = w;
      h.append(s);
      if (i < ws.length - 1) h.append(' ');
      return s;
    });
  })();

  // 4: os seis estados reais da FichaIndicacao, empilhados
  const ESTADOS = [
    'fichaVazia',
    'fichaPreenchida',
    'fichaBtc',
    'fichaBtcLn',
    'fichaEnviando',
    'fichaRecebida',
  ];
  const fichas = {};
  for (const nome of ESTADOS) {
    const box = document.createElement('div');
    box.className = 'ficha-estado';
    box.append(frag(nome));
    for (const el of $$('[id]', box)) {
      el.dataset.id = el.id;
      el.removeAttribute('id');
    }
    $('#s4fichas').append(box);
    fichas[nome] = box;
  }
  const passos = $$('.passo');

  // 5
  $('#s5estufa').append(frag('estufa'));
  const secaoEstufa = $('#s5estufa section');
  secaoEstufa.style.paddingBottom = '0';
  secaoEstufa.style.paddingTop = '34px';
  const svgEstufa = $('svg', secaoEstufa);
  const tracos = $$('path, circle', svgEstufa);
  $('#s5').style.display = 'block';
  const tracoInfo = tracos.map((el) => {
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len} ${len}`;
    return { el, len };
  });
  // desenha de baixo pra cima: estrutura e arcadas, depois cupulas, grade por ultimo
  const ordem = tracoInfo
    .map((info, i) => {
      const bb = info.el.getBBox();
      const fraco = Number(info.el.getAttribute('opacity') || 1) < 0.5 ? 1 : 0;
      return { ...info, chave: fraco * 1000 + (262 - (bb.y + bb.height)) + i * 0.01 };
    })
    .sort((a, b) => a.chave - b.chave);
  ordem.forEach((info, i) => {
    info.ordem = i / (ordem.length - 1);
  });
  $('#s5').style.display = 'none';
  const regraVerde = svgEstufa.nextElementSibling;
  const caixaCta = regraVerde.nextElementSibling;
  const faixaCta = caixaCta.nextElementSibling;
  const ornamentos = faixaCta.nextElementSibling;
  const legendaEstufa = ornamentos.nextElementSibling;
  legendaEstufa.style.visibility = 'hidden';
  $('#s5').style.display = 'block';
  $('#s5marca').style.top = `${ornamentos.getBoundingClientRect().bottom + 52}px`;
  $('#s5').style.display = 'none';
  const [ctaTexto, ctaBotao] = caixaCta.children;
  const [ctaP1, ctaP2] = ctaTexto.children;

  // ---------- helpers ----------
  const set = (el, { o, x = 0, y = 0, s = 1, sx, sy, r = 0, extra = '' } = {}) => {
    if (o !== undefined) el.style.opacity = o;
    const sxv = sx ?? s;
    const syv = sy ?? s;
    el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sxv}, ${syv}) ${extra}`;
  };
  const entra = (el, t, a, dur = 0.35, dist = 36) => {
    const k = outCubic(p(t, a, a + dur));
    set(el, { o: k, y: (1 - k) * dist });
  };
  const mostrar = (cena, sim) => {
    $(cena).style.display = sim ? 'block' : 'none';
  };

  // posicoes alvo do cursor na ficha (em px do palco, camera em 0)
  let alvos = null;
  const medirAlvos = () => {
    const cam = $('#s4camera');
    const salvo = cam.style.transform;
    cam.style.transform = 'none';
    $('#s4').style.display = 'block';
    const centro = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.55 };
    };
    const vazia = fichas.fichaVazia;
    const btcLn = fichas.fichaBtcLn;
    const chips = $$('fieldset button', btcLn);
    const enviar = $('button[type="submit"]', btcLn);
    alvos = {
      nome: centro($('[data-id="indicar-nome"]', vazia)),
      ramo: centro($('[data-id="indicar-ramo"]', vazia)),
      bairro: centro($('[data-id="indicar-bairro"]', vazia)),
      btc: centro(chips.find((b) => b.textContent === 'BTC')),
      ln: centro(chips.find((b) => b.textContent === 'Lightning')),
      enviar: centro(enviar),
      alturaFicha: vazia.getBoundingClientRect().height,
      chipsY: centro(chips[0]).y,
      enviarY: centro(enviar).y,
    };
    alvos.cam1 = -(alvos.chipsY - 430);
    alvos.cam2 = -(alvos.enviarY - 830);
    alvos.nome.x -= 120;
    alvos.bairro.x -= 60;
    alvos.ramo.x -= 40;
    cam.style.transform = salvo;
  };

  const digitar = (texto, t, a, b) => texto.slice(0, Math.round(texto.length * p(t, a, b)));

  // ---------- quadro ----------
  window.render = (t) => {
    if (!alvos) medirAlvos();

    // ===== 1 · gancho (0 – 3.5)
    mostrar('#s1', t < 3.55);
    if (t < 3.55) {
      entra($('#q1'), t, 0.1, 0.38, 60);
      entra($('#q2'), t, 0.28, 0.38, 60);
      const txt = digitar(RESPOSTA, t, 0.9, 1.5);
      $('#respostaTexto').textContent = txt;
      $('#caret').style.visibility =
        t > 0.75 && t < 1.7 && (t < 1.5 || Math.floor(t * 4) % 2 === 0) ? 'visible' : 'hidden';
      $('#resposta').style.opacity = t < 0.75 ? 0 : lerp(1, 0.4, p(t, 1.75, 1.95));
      set($('#risco'), { sx: outCubic(p(t, 1.75, 1.9)), sy: 1 });
      // carimbo: cai rapido, assenta com um quique curto
      const c = $('#carimbo1');
      if (t < 2.0) set(c, { o: 0 });
      else {
        const q = p(t, 2.0, 2.09);
        let s = lerp(1.9, 1, inCubic(q));
        if (t > 2.09) s = 1 - 0.035 * Math.sin(p(t, 2.09, 2.24) * Math.PI);
        set(c, { o: clamp(q * 3), s, r: -6 });
      }
      const tremor =
        t > 2.08 && t < 2.3 ? Math.sin((t - 2.08) * 90) * 7 * (1 - p(t, 2.08, 2.3)) : 0;
      const saida = inCubic(p(t, 3.22, 3.5));
      set($('#s1c'), { o: 1 - saida, x: tremor, y: tremor * 0.4 - saida * 70 });
      set($('#s1base'), { o: 1 - saida });
    }

    // ===== 2 · revelacao (3.4 – 7.6)
    const v2 = t >= 3.4 && t < 7.6;
    mostrar('#s2', v2);
    if (v2) {
      set(header, { y: lerp(-140, 0, outCubic(p(t, 3.42, 3.78))) });
      calcadaHeader.style.clipPath = `inset(0 ${100 - 100 * inOutCubic(p(t, 3.58, 4.05))}% 0 0)`;
      entra(olho, t, 3.78, 0.32, 20);
      palavras.forEach((w, i) => {
        entra(w, t, 4.0 + i * 0.06, 0.36, 46);
      });
      entra(paragrafo, t, 4.42, 0.4, 20);
      [...botoes.children].forEach((b, i) => {
        const k = outBack(p(t, 4.6 + i * 0.08, 4.92 + i * 0.08));
        set(b, { o: clamp(p(t, 4.6 + i * 0.08, 4.75 + i * 0.08)), s: lerp(0.86, 1, k) });
      });
      // portal sobe da base
      baseBarra.style.transformOrigin = 'center';
      set(baseBarra, { sx: outCubic(p(t, 3.9, 4.25)), sy: 1 });
      const sobe = (el, a, b) => {
        el.style.transformOrigin = 'bottom center';
        set(el, { sy: outCubic(p(t, a, b)), sx: 1 });
      };
      sobe(torreE, 4.05, 4.45);
      sobe(torreD, 4.05, 4.45);
      sobe(vaoE, 4.14, 4.52);
      sobe(vaoD, 4.14, 4.52);
      sobe(pilarE, 4.2, 4.5);
      sobe(pilarD, 4.2, 4.5);
      sobe(arco, 4.24, 4.72);
      gradeArco.style.opacity = p(t, 4.55, 4.9);
      // pinhoes caem no mapa nos tempos 5.0 / 5.5 / 6.0
      pinhoes.forEach((pin, i) => {
        const pouso = 5.0 + i * 0.5;
        const q = p(t, pouso - 0.26, pouso);
        let y = lerp(-170, 0, q * q);
        if (t > pouso)
          y =
            -16 *
            Math.abs(Math.sin(p(t, pouso, pouso + 0.3) * Math.PI)) *
            (1 - p(t, pouso, pouso + 0.3));
        pin.style.opacity = t < pouso - 0.26 ? 0 : 1;
        pin.style.transform = `translateY(${y}px) rotate(45deg)`;
      });
      entra(legendaPortal, t, 4.9, 0.3, 10);
      // o painel da cena 3 empurra o heroi
      set($('#s2c'), { y: -60 * inOutCubic(p(t, 7.25, 7.55)) });
    }

    // ===== 3 · selo (7.25 – 11.05)
    const v3 = t >= 7.25 && t < 11.2;
    mostrar('#s3', v3);
    if (v3) {
      const sobe = inOutCubic(p(t, 7.25, 7.55));
      const sai = inOutCubic(p(t, 10.95, 11.17));
      set($('#s3painel'), { y: (1 - sobe) * 1080 - sai * 1080 });
      const fora = inCubic(p(t, 10.72, 10.95));
      entra($('#s3olho'), t, 7.58, 0.3, 16);
      $('#s3olho').style.opacity *= 1 - fora;
      s3palavras.forEach((w, i) => {
        entra(w, t, 7.65 + i * 0.05, 0.34, 40);
        w.style.opacity *= 1 - fora;
      });
      const cornija = $('#s3cornija');
      set(cornija, { sx: outCubic(p(t, 7.72, 8.05)), sy: 1, o: 1 - fora });
      s3linhas.forEach((linha, i) => {
        const pouso = 8.0 + i * 0.5;
        const selo = $('.s3selo', linha);
        const q = p(t, pouso - 0.09, pouso);
        let s = lerp(1.7, 1, inCubic(q));
        if (t > pouso) s = 1 - 0.03 * Math.sin(p(t, pouso, pouso + 0.14) * Math.PI);
        set(selo, { o: t < pouso - 0.09 ? 0 : clamp(q * 3) * (1 - fora), s, r: [-3, 2, -1.5][i] });
        const leg = $('.s3legenda', linha);
        const k = outCubic(p(t, pouso + 0.06, pouso + 0.36));
        set(leg, { o: k * (1 - fora), x: (1 - k) * -30 });
        linha.style.borderBottomColor = `rgba(201,191,168,${clamp(p(t, pouso - 0.1, pouso + 0.2)) * (1 - fora)})`;
        set(linha, { y: -fora * 24 * (1 + i * 0.3) });
      });
    }

    // ===== 4 · indicar (10.95 – 16.05)
    const v4 = t >= 10.95 && t < 16.05;
    mostrar('#s4', v4);
    const cursor = $('#cursor');
    const ripple = $('#ripple');
    cursor.style.display = 'none';
    ripple.style.display = 'none';
    if (v4) {
      const fora = inCubic(p(t, 15.72, 15.98));
      set($('#s4c'), { o: 1 - fora, y: -fora * 40 });
      entra($('#s4olho'), t, 11.05, 0.3, 14);
      const ativo = t < 14.32 ? 0 : t < 15.0 ? 1 : 2;
      passos.forEach((passo, i) => {
        const k = outCubic(p(t, 11.12 + i * 0.1, 11.47 + i * 0.1));
        const foco = i === ativo ? 1 : 0.34;
        set(passo, { o: k * foco, x: (1 - k) * -40 });
        const barra = $('.passo-barra', passo);
        const inicio = [11.4, 14.32, 15.0][i];
        const fim = [14.32, 15.0, 99][i];
        const on = outCubic(p(t, inicio, inicio + 0.2)) * (1 - p(t, fim, fim + 0.12));
        set(barra, { sy: on, sx: 1 });
      });
      // selo publicado no passo 03
      const sp = $('#s4selo');
      const q3 = p(t, 15.0, 15.09);
      let s3 = lerp(1.8, 1, inCubic(q3));
      if (t > 15.09) s3 = 1 - 0.04 * Math.sin(p(t, 15.09, 15.22) * Math.PI);
      set(sp, { o: t < 15.0 ? 0 : clamp(q3 * 3), s: s3, r: -3 });

      // estado da ficha
      let estado = 'fichaVazia';
      if (t >= 12.55) estado = 'fichaPreenchida';
      if (t >= 13.35) estado = 'fichaBtc';
      if (t >= 13.6) estado = 'fichaBtcLn';
      if (t >= 14.05) estado = 'fichaEnviando';
      if (t >= 14.32) estado = 'fichaRecebida';
      for (const nome of ESTADOS) fichas[nome].style.display = nome === estado ? 'block' : 'none';
      const box = fichas[estado];

      const entrada = outCubic(p(t, 11.02, 11.42));
      const nome = $('[data-id="indicar-nome"]', box);
      const ramo = $('[data-id="indicar-ramo"]', box);
      const bairro = $('[data-id="indicar-bairro"]', box);
      if (estado === 'fichaVazia') {
        nome.value = digitar('Café das Araucárias', t, 11.55, 12.15);
        ramo.value = t >= 12.33 ? 'cafe' : '';
        bairro.value = '';
      }
      if (estado === 'fichaPreenchida') bairro.value = digitar('Batel', t, 12.5, 12.75) || 'B';
      const focar = (el, on) => {
        if (!el) return;
        el.style.borderBottomColor = on ? 'var(--color-verde)' : '';
      };
      focar(nome, t >= 11.5 && t < 12.25);
      focar(ramo, t >= 12.25 && t < 12.5);
      focar(bairro, t >= 12.5 && t < 13.45);

      // camera: desce ate os chips e o botao; na ficha recebida, centraliza o cartao
      const cam =
        lerp(0, alvos.cam1, inOutCubic(p(t, 12.8, 13.2))) +
        (alvos.cam2 - alvos.cam1) * inOutCubic(p(t, 13.68, 13.95));
      const camera = $('#s4camera');
      if (estado === 'fichaRecebida') {
        const k = outCubic(p(t, 14.32, 14.57));
        const altura = box.getBoundingClientRect().height;
        set(camera, { o: k, y: (1080 - altura) / 2 - 70 + (1 - k) * 30, s: lerp(0.97, 1, k) });
      } else {
        const sumir = p(t, 14.2, 14.32);
        set(camera, { o: entrada * (1 - sumir), x: (1 - entrada) * 90, y: cam });
      }

      // cursor
      const C = alvos;
      const off = (pt) => ({ x: pt.x, y: pt.y + cam });
      const chaves = [
        [11.3, { x: 1760, y: 1040 }],
        [11.48, off(C.nome)],
        [12.15, off(C.nome)],
        [12.25, off(C.ramo)],
        [12.4, off(C.ramo)],
        [12.5, off(C.bairro)],
        [12.8, off(C.bairro)],
        [13.33, off(C.btc)],
        [13.4, off(C.btc)],
        [13.58, off(C.ln)],
        [13.68, off(C.ln)],
        [14.03, off(C.enviar)],
        [14.32, off(C.enviar)],
      ];
      if (t >= 11.3 && t < 14.32) {
        let pos = chaves[0][1];
        for (let i = 0; i < chaves.length - 1; i++) {
          const [ta, a] = chaves[i];
          const [tb, b] = chaves[i + 1];
          if (t >= ta && t <= tb) {
            const k = inOutCubic(p(t, ta, tb));
            pos = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
            break;
          }
          if (t > tb) pos = b;
        }
        const cliques = [11.5, 12.25, 12.5, 13.35, 13.6, 14.05];
        let aperta = 1;
        for (const c of cliques) if (t >= c - 0.02 && t < c + 0.1) aperta = 0.86;
        cursor.style.display = 'block';
        cursor.style.opacity = clamp(p(t, 11.3, 11.4)) * (1 - p(t, 14.16, 14.3));
        cursor.style.transform = `translate(${pos.x - 6}px, ${pos.y - 4}px) scale(${aperta})`;
        cursor.style.transformOrigin = '6px 4px';
        for (const c of cliques) {
          if (t >= c && t < c + 0.32) {
            const k = p(t, c, c + 0.32);
            ripple.style.display = 'block';
            ripple.style.left = `${pos.x}px`;
            ripple.style.top = `${pos.y}px`;
            ripple.style.opacity = (1 - k) * 0.9;
            ripple.style.transform = `scale(${lerp(0.3, 1.25, outCubic(k))})`;
          }
        }
      }
    }

    // ===== 5 · fecho (15.95 – fim)
    const v5 = t >= 15.95;
    mostrar('#s5', v5);
    if (v5) {
      for (const info of ordem) {
        const a = 16.0 + info.ordem * 1.0;
        const k = inOutCubic(p(t, a, a + 0.42));
        info.el.style.strokeDashoffset = `${info.len * (1 - k)}`;
      }
      regraVerde.style.transformOrigin = 'center';
      set(regraVerde, { sx: outCubic(p(t, 16.85, 17.15)), sy: 1 });
      const kc = outCubic(p(t, 16.98, 17.32));
      caixaCta.style.clipPath = `inset(0 0 ${100 - 100 * kc}% 0)`;
      faixaCta.style.transformOrigin = 'center';
      set(faixaCta, { sx: kc, sy: 1 });
      entra(ctaP1, t, 17.14, 0.34, 18);
      entra(ctaP2, t, 17.3, 0.34, 12);
      const kb = p(t, 17.46, 17.76);
      set(ctaBotao, { o: clamp(kb * 3), s: lerp(0.84, 1, outBack(kb)) });
      const orn = [...ornamentos.children];
      const tempos = [18.2, 18.1, 18.0, 18.1, 18.2];
      orn.forEach((o, i) => {
        const k = p(t, tempos[i], tempos[i] + 0.22);
        o.style.opacity = clamp(k * 3);
        o.style.transform = `scale(${lerp(0.2, 1, outBack(k))})`;
      });
      entra($('#s5marca'), t, 18.3, 0.4, 16);
      // respiro lento ate o fim
      const z = lerp(1, 1.018, inOutCubic(p(t, 16.0, 20.5)));
      $('#s5c').style.transform = `scale(${z})`;
      $('#s5c').style.transformOrigin = '50% 45%';
    }
  };
})();
