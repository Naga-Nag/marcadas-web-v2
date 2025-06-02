<script lang="ts">
    export let label = "Tag"; // The tag text can be passed as a prop
    export let color = "blue"; // Color prop to style the tag
    export let className = "";
  </script>
  
  <style>
    .tag {
      display: inline-block;
      padding: 0.3em 1em;
      font-size: 0.85rem;
      font-weight: semibold;
      color: rgb(255, 255, 255);
      background-color: var(--tag-color, blue);
      border-radius: 0.5em;
      margin: 0.2em;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 10%), 0 1px 3px rgb(0 0 0 / 30%);
    }
  </style>
  
  <div class="tag {className} cursor:default" style="--tag-color: {color};">
    {label}
  </div>
  