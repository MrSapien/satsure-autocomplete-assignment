(() => {
  const suggestions = [
    'agile methodology',
    'agile methodology process',
    'agile methodology process testing'
  ];

  const input = document.querySelector('#input-field');
  const list = document.querySelector('.suggestions');
  const nextButton = document.querySelector('#next-button');
  const errorMessage = document.querySelector('.error-message');
  const successContainer = document.querySelector('.success-container');
  const mode = new URLSearchParams(window.location.search).get('mode') === 'anywhere'
    ? 'anywhere'
    : 'prefix';

  let startDate = toIstLocalTimestamp(new Date());
  let visibleSuggestions = [...suggestions];

  function toIstLocalTimestamp(date) {
    const istMilliseconds = date.getTime() + (5 * 60 + 30) * 60 * 1000;
    return new Date(istMilliseconds).toISOString().replace('Z', '+05:30');
  }

  function matchingValues(value) {
    const normalized = value.trim().toLocaleLowerCase('en-IN');
    if (!normalized) return [...suggestions];
    return suggestions.filter(item => {
      const candidate = item.toLocaleLowerCase('en-IN');
      return mode === 'anywhere'
        ? candidate.includes(normalized)
        : candidate.startsWith(normalized);
    });
  }

  function renderSuggestions(values) {
    visibleSuggestions = values;
    list.replaceChildren();
    for (const value of values) {
      const item = document.createElement('li');
      item.textContent = value;
      item.setAttribute('role', 'option');
      item.addEventListener('click', () => {
        input.value = value;
        renderSuggestions(matchingValues(value));
        input.focus();
      });
      list.appendChild(item);
    }
    list.style.display = values.length ? 'block' : 'none';
  }

  async function submit() {
    const text = input.value.trim();
    const isExactSuggestion = suggestions.includes(text);
    errorMessage.style.display = 'none';
    successContainer.style.display = 'none';

    if (!isExactSuggestion) {
      errorMessage.style.display = 'inline';
      return;
    }

    const payload = {
      account_id: '98765',
      account_email: 'test123@gmail.com',
      start_date: startDate,
      end_date: toIstLocalTimestamp(new Date()),
      locale: 'en-IN',
      text,
      suggestion_list: matchingValues(text).join(', '),
      completed: true
    };

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Submission failed with ${response.status}`);
      }
      successContainer.style.display = 'block';
    } catch (_error) {
      errorMessage.textContent = 'Error: Unable to save your response. Please retry.';
      errorMessage.style.display = 'inline';
    }
  }

  input.addEventListener('input', () => {
    renderSuggestions(matchingValues(input.value));
    errorMessage.style.display = 'none';
    successContainer.style.display = 'none';
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      input.value = '';
      list.style.display = 'none';
      visibleSuggestions = [];
    }
  });

  nextButton.addEventListener('click', () => void submit());
  renderSuggestions(visibleSuggestions);
})();
