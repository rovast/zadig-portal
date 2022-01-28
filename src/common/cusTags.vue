<script>
export default {
  name: 'CusTags',
  props: {
    values: {
      type: Array,
      required: true
    }
  },
  render (h) {
    return (
      <div class="cus-tags">
        {this.values.map(value => (
          <span class="cut-tag">{value}</span>
        ))}
      </div>
    )
  }
}
</script>

<style lang="less" scoped>
@tagColor: #8a8a8a;

.cus-tags {
  display: inline-block;
  color: @tagColor;
  font-size: 12px;
  border: 1px solid @borderGray;
  border-radius: 4px;

  .cut-tag {
    position: relative;
    display: inline-block;
    padding: 0 1em;
    line-height: 2;

    &:not(:last-child) {
      &::after {
        position: absolute;
        top: 0.28em;
        right: -0.28em;
        width: 1.4em;
        height: 1.4em;
        border-top: 1px solid @borderGray;
        border-right: 1px solid @borderGray;
        transform: rotate(45deg);
        content: '';
      }
    }
  }
}
</style>
