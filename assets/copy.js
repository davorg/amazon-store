document.querySelectorAll('pre > code').forEach(code => {
  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  btn.className = 'copy-btn';
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code.innerText);
    btn.textContent = 'Copied!';
    setTimeout(()=>btn.textContent='Copy', 1500);
  });
  code.parentElement.style.position = 'relative';
  code.parentElement.appendChild(btn);
});

