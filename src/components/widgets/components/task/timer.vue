<template>
  <el-input
    :placeholder="placeholder"
    :class="{ time: isTime }"
    ref="time"
    @blur="checkTime"
    v-model="newlovingVue"
    @input="formatValue"
    @change="inputKeyup"
  ></el-input>
</template>

<script>
export default {
  name: "index",
  props: {
    placeholder: {},
    lovingVue: {
      default: "",
    },
    sign: {
        type: Boolean,
        default: true,
    },
  },
  model: {
    prop: "lovingVue",
    event: "change",
  },
  data() {
    return {
      isTime: false,
      newlovingVue: this.lovingVue,
    };
  },
  watch: {
    newlovingVue: {
      handler(newVal) {
        if (newVal && +newVal.substring(0, 2) > 3 && this.sign) {
          this.isTime = true;
        } else {
          this.isTime = false;
        }
        // this.$emit('change',newVal)
      },
      immediate: true,
    },

    lovingVue(n) {
      this.newlovingVue = n;
    },
  },
  created() {},
  methods: {
    checkTime(v) {
      if (+v.target.value.substring(0, 2) > 3 && this.sign) {
        this.isTime = true;
        //  this.$confirm('时长过长，是否创建!', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
        //
        // }).catch(() => {
        // });
      } else {
        this.isTime = false;
      }
    },
    formatValue(n) {
      var t = this.clearInvalidInput(parseInt(n) > 2400 ? "2400:00" : n);
      this.newlovingVue = t;
      t.match(/[:|：](\d){2}$/) && this.onDurationBlur();
    },
    onDurationBlur() {
      this.newlovingVue = this.formatForDuration(this.newlovingVue).formatted;
      this.$emit("changeTime", this.newlovingVue);
    },
    formatForDuration: function (e) {
      var t = "";
      if (e) {
        if (e)
          if (((e = this.toCDB(e)), e.includes(":"))) {
            var a = String(e).split(":")[0],
              n = String(e).split(":")[1];
            (a = a.replace(/\D/g, "0")),
              (n = n.replace(/\D/g, "0").substr(0, 2)),
              (a = a.length > 2 ? a.replace(/^0+/g, "") : a),
              (a = this.padStartPolyfill(a, 2, "0")),
              (n = this.padStartPolyfill(n, 2, "0")),
              (n = n < 60 ? n : "00"),
              (t = a + ":" + n);
            var r = Number(a.replace(/\D/g, "0"));
            (a = 0 === r ? "00" : a), (e = a > 999 ? "999:59+" : a + ":" + n);
          } else
            (e = e.replace(/\D/g, "0")),
              (e = e.length > 2 ? e.replace(/^0+/g, "") : e),
              (e = this.padStartPolyfill(e, 2, "0")),
              (t = e + ":00"),
              (e = e > 999 ? "999:59+" : e + ":00");
        return {
          original: t,
          formatted: e,
        };
      }
      return {
        original: t,
        formatted: t,
      };
    },
    padStartPolyfill: function (e, t, a) {
      var n = "";
      if ("string" == typeof e) {
        if (String.prototype.padStart) return e.padStart(t, a);
        var r = Math.max(t - e.length, 0);
        if (r) {
          for (let i = 0; i < r; i++) n += a;
          return n + e;
        }
        return e;
      }
      if (e) throw new Error("padStartPolyfill can not pad without String");
      for (let i = 0; i < t; i++) n += a;
      return n;
    },
    toCDB: function (e) {
      for (var t = "", a = 0; a < e.length; a++)
        t +=
          12288 != e.charCodeAt(a)
            ? e.charCodeAt(a) > 65280 && e.charCodeAt(a) < 65375
              ? String.fromCharCode(e.charCodeAt(a) - 65248)
              : String.fromCharCode(e.charCodeAt(a))
            : String.fromCharCode(e.charCodeAt(a) - 12256);
      return t;
    },
    clearInvalidInput: function (e) {
      if (((e = this.toCDB(e)), e.includes(":"))) {
        var t = String(e).split(":")[0],
          a = String(e).split(":")[1].substr(0, 2);
        (t = t.replace(/\D/g, "0")),
          (a = a.replace(/\D/g, "0")),
          (t = this.padStartPolyfill(t, 2, "0")),
          (a = a < 60 ? a : "00"),
          (e = t + ":" + a);
      } else
        (e = e.replace(/\D/g, "0")),
          3 === e.length && (e = e.substr(0, 2) + ":" + e.substr(2));
      return e;
    },
    inputKeyup() {
      this.onDurationBlur();
      this.$emit("change", this.newlovingVue);
    },
  },
};
</script>

<style scoped lang="scss">
.time {
  :deep(.el-input__inner) {
    color: red !important;
  }
}
:deep(.el-input__inner) {
  height: 30px;
}
</style>
