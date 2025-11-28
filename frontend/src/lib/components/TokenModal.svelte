<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TokenData, TokenType, TokenValueType } from '$lib/types';
  import { collectionsStore } from '$lib/stores/collections';
  import { createUniqueId } from '$lib/utils';

  export let isOpen = false;
  export let collectionId: string;
  export let categoryId: string;

  const dispatch = createEventDispatcher<{
    close: void;
    save: void;
  }>();

  let tokenName = '';
  let tokenType: TokenType = 'color';
  let tokenValue = '';
  let tokenDescription = '';

  // Additional fields for typography
  let fontFamily = 'Arial, sans-serif';
  let fontSize = '16px';
  let fontWeight = 400;
  let lineHeight = '1.5';
  let letterSpacing = '0';

  function handleClose() {
    dispatch('close');
  }

  function parseTokenValue(type: TokenType, value: string): TokenValueType {
    switch (type) {
      case 'color':
        return value;
      case 'dimension':
        const [numStr, unit = 'px'] = value.split(/(\d+)/).filter(Boolean);
        return {
          value: parseFloat(numStr),
          unit
        };
      case 'typography':
        return {
          'font-family': fontFamily,
          'font-size': fontSize,
          'font-weight': fontWeight,
          'line-height': lineHeight,
          'letter-spacing': letterSpacing
        };
      default:
        return value;
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const token = {
      name: tokenName,
      type: tokenType,
      value: parseTokenValue(tokenType, tokenValue),
      description: tokenDescription || '',
      extensions: {
        'com.username.myapp': {
          id: `id-${Date.now()}-${createUniqueId()}`
        }
      }
    };

    await collectionsStore.addToken(collectionId, categoryId, token);
    dispatch('save');
    handleClose();
  }

  const tokenTypes: TokenType[] = ['color', 'typography', 'dimension'];
</script>

{#if isOpen}
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>Add Token</h2>
        <button class="close-button" on:click={handleClose}>×</button>
      </div>
      <form on:submit={handleSubmit}>
        <div class="form-group">
          <label for="tokenName">Name</label>
          <input
            type="text"
            id="tokenName"
            bind:value={tokenName}
            required
          />
        </div>
        <div class="form-group">
          <label for="tokenType">Type</label>
          <select id="tokenType" bind:value={tokenType}>
            {#each tokenTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        {#if tokenType === 'typography'}
          <div class="form-group">
            <label for="fontFamily">Font Family</label>
            <input
              type="text"
              id="fontFamily"
              bind:value={fontFamily}
              placeholder="Arial, sans-serif"
            />
          </div>
          <div class="form-group">
            <label for="fontSize">Font Size</label>
            <input
              type="text"
              id="fontSize"
              bind:value={fontSize}
              placeholder="16px"
            />
          </div>
          <div class="form-group">
            <label for="fontWeight">Font Weight</label>
            <input
              type="number"
              id="fontWeight"
              bind:value={fontWeight}
              min="100"
              max="900"
              step="100"
            />
          </div>
          <div class="form-group">
            <label for="lineHeight">Line Height</label>
            <input
              type="text"
              id="lineHeight"
              bind:value={lineHeight}
              placeholder="1.5"
            />
          </div>
          <div class="form-group">
            <label for="letterSpacing">Letter Spacing</label>
            <input
              type="text"
              id="letterSpacing"
              bind:value={letterSpacing}
              placeholder="0"
            />
          </div>
        {:else}
          <div class="form-group">
            <label for="tokenValue">Value</label>
            <input
              type={tokenType === 'color' ? 'color' : 'text'}
              id="tokenValue"
              bind:value={tokenValue}
              required
              placeholder={tokenType === 'color' ? '#000000' : 
                tokenType === 'dimension' ? '16px' : ''}
            />
          </div>
        {/if}

        <div class="form-group">
          <label for="tokenDescription">Description</label>
          <textarea
            id="tokenDescription"
            bind:value={tokenDescription}
            rows="3"
          ></textarea>
        </div>
        <div class="button-group">
          <button type="button" class="cancel-button" on:click={handleClose}>
            Cancel
          </button>
          <button type="submit" class="save-button">Save</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .modal {
    background-color: var(--color-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    width: 90%;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-6);
  }

  h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .close-button {
    background: none;
    border: none;
    font-size: var(--font-size-2xl);
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .close-button:hover {
    color: var(--color-text-primary);
  }

  .form-group {
    margin-bottom: var(--spacing-4);
  }

  label {
    display: block;
    margin-bottom: var(--spacing-2);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-md);
    background-color: var(--color-card);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-emerald-600);
    box-shadow: 0 0 0 1px var(--color-emerald-600);
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-3);
    margin-top: var(--spacing-6);
  }

  .cancel-button,
  .save-button {
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .cancel-button {
    background: none;
    border: 1px solid var(--color-card-border);
    color: var(--color-text-secondary);
  }

  .cancel-button:hover {
    border-color: var(--color-text-secondary);
    color: var(--color-text-primary);
  }

  .save-button {
    background-color: var(--color-emerald-600);
    border: none;
    color: white;
  }

  .save-button:hover {
    background-color: var(--color-emerald-700);
  }
</style> 