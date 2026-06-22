<template>
  <div
    id="outBox"
    style="display: inline-block"
  >
    <div
      class="queryButton"
      id="queryButton"
      style="margin: 0 auto"
    >
      <div class="buttonWrap_small">
        <div class="button-group-search">
          <el-tooltip placement="top" content="高级筛选">
            <div
             @click.stop.prevent="handleDrawerOpen"
             class="searchIcon"
             :class="{ emptyFilter: isEmptyQuery }">
              <i class="bx bx-filter-alt"></i>
            </div>
          </el-tooltip>
          <!-- 外部弹窗 -->
          <el-dialog
            v-model="drawerState"
            :width="900"
            draggable
            :destroy-on-close="false"
            :close-on-click-modal="false"
          >
            <LoadingOverlay height="90%" :loading="filtersLoading" />
            <template #header>
              <div class="search-containe">
                <div class="search-name">{{ $trans("common.filter") }}</div>
              </div>
            </template>
            <div
              id="searchWrap"
              ref="searchWrap"
            >
              <div class="form-container w-full">
                <el-form
                  label-width="150px"
                  label-position="top"
                  size="default"
                  @keyup.enter="handleSearch(0)"
                  style="
                    margin-top: 10px;
                    display: grid;
                    justify-content: center;
                    grid-template-columns: repeat(auto-fill, 400px);
                  "
                >
                  <template v-if="bussId ==5">
                    <el-form-item label="案件文号" class="postInfo-container-item">
                      <div style="display: flex;gap: 10px;">
                        <el-input clearable @change="agentNumStartChange" type="text" v-model="queryModuleData.agentNumStart" placeholder="请输入案件文号"/>
                        <span>至</span>
                        <el-input clearable type="text" v-model="queryModuleData.agentNumEnd" placeholder="请输入案件文号"/>
                      </div>
                    </el-form-item>
                    <el-form-item label="商标类别" class="postInfo-container-item">
                      <el-input type="text" clearable v-model="queryModuleData.goodClasses" placeholder="请输入商标类别"/>
                    </el-form-item>
                    <el-form-item label="商标号" class="postInfo-container-item">
                      <el-input type="text" clearable v-model="queryModuleData.regNumber" placeholder="请输入商标号"/>
                    </el-form-item>
                    <el-form-item label="商标名称" class="postInfo-container-item">
                      <el-input type="text" clearable v-model="queryModuleData.tmName" placeholder="请输入商标名称"/>
                    </el-form-item>
                  </template>
                  <template v-if="[3,23,27,28,29,11].includes(bussId)">
                    <el-form-item label="案件文号" class="postInfo-container-item">
                      <div style="display: flex;gap: 10px;">
                        <el-input clearable @change="agentNumStartChange" type="text" v-model="queryModuleData.agentNumStart" placeholder="请输入案件文号"/>
                        <span>至</span>
                        <el-input clearable type="text" v-model="queryModuleData.agentNumEnd" placeholder="请输入案件文号"/>
                      </div>
                    </el-form-item>
                  </template>
                  <el-form-item
                    :label="item.filterName + ':'"
                    :class="
                      item.filterType === 'radio' && item.values.length > 3
                        ? 'fullItem'
                        : 'postInfo-container-item'
                    "
                    v-for="(item, index) in conditionsModuleList"
                    :key="index"
                  >
                    <!-- <el-select
                      v-model="queryModuleData[item.property]"
                      :placeholder="$trans('common.selectPlaceholder')"
                      v-if="item.filterType === 'select'"
                      filterable
                      clearable
                    >
                      <el-option
                        v-for="itm in bussId == 119
                          ? item.values.slice(4, item.values.length - 1)
                          : bussId == 118
                          ? item.values.slice(0, 4)
                          : item.values"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      >
                      </el-option>
                    </el-select> -->
                    <el-select-v2
                      v-if="item.filterType === 'select'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values || []"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      reserve-keyword
                      filterable
                      clearable
                      :props="{
                        value: 'id',
                        label: 'value',
                      }"
                    />
                    <el-select-v2
                      v-if="item.filterType === 'selectCreate'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values || []"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      :reserve-keyword="false"
                      allow-create
                      filterable
                      clearable
                      :props="{
                        value: 'id',
                        label: 'value',
                      }"
                    />
                    <el-select-v2
                      v-if="item.filterType === 'checkbox'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values || []"
                      :multiple="true"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      reserve-keyword
                      filterable
                      clearable
                      @change="(e) => checkBox(e, item.property, item.values)"
                      :props="{
                        value: 'id',
                        label: 'value',
                        key: 'id',
                      }"
                    />
                    <!-- <el-select
                      v-if="item.filterType === 'selectMany'"
                      v-model="queryModuleData[item.property]"
                      filterable
                      remote
                      clearable
                      reserve-keyword
                      :placeholder="$trans('common.keywordPlaceholder')"
                      :remote-method="
                        (queryString) => {
                          remoteMethod(
                            queryString,
                            index,
                            item.property,
                            item.filterName
                          );
                        }
                      "
                    >
                      <el-option
                        v-for="itm in item['valueList']"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      >
                      </el-option>
                    </el-select> -->
                    <el-select-v2
                      v-if="item.filterType === 'selectMany'"
                      v-model="queryModuleData[item.property]"
                      :multiple="true"
                      :options="item.values || []"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      filterable
                      clearable
                      collapse-tags
                      :max-collapse-tags="5"
                      :props="{
                        value: 'id',
                        label: 'value',
                      }"
                    />
                    <el-select
                      v-if="item.filterType === 'selectMultipleMany' || item.filterType === 'selectMultipleManyTable' || item.filterType === 'selectTableMultipleMany'"
                      :multiple="true"
                      v-model="queryModuleData[item.property]"
                      filterable
                      remote
                      clearable
                      collapse-tags
                      :max-collapse-tags="5"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      :remote-method="
                        (queryString) => {
                          remoteMethod(
                            queryString,
                            index,
                            item.property,
                            item.filterName
                          );
                        }
                      "
                    >
                      <el-option
                        v-for="itm in item['valueList']"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      >
                      </el-option>
                    </el-select>
                    <el-select
                      v-if="item.filterType === 'selectTableMany' && custConfigList.concat(addrConfigList).includes(item.property)"
                      v-model="queryModuleData[item.property]"
                      filterable
                      remote
                      clearable
                      collapse-tags
                      :max-collapse-tags="5"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      :remote-method="
                        (queryString) => {
                          remoteMethod(
                            queryString,
                            index,
                            item.property,
                            item.filterName
                          );
                        }
                      "
                    >
                    <template #header>
                      <div style="display: flex;justify-content: space-between;padding-right: 20px;">
                        <span v-for="(title,index) in getListTitle(item.property)" :key="index">{{ title }}</span>
                      </div>
                    </template>
                      <el-option
                        v-for="itm in item['valueList']"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      >
                        <div style="display: flex;justify-content: space-between;">
                          <span>{{ itm.value }}</span>
                          <span>{{ itm.value1 }}</span>
                        </div>
                      </el-option>
                    </el-select>
                    <el-select
                      v-if="item.filterType === 'selectTableMany' && !(custConfigList.concat(addrConfigList).includes(item.property))"
                      v-model="queryModuleData[item.property]"
                      filterable
                      remote
                      clearable
                      reserve-keyword
                      collapse-tags
                      :max-collapse-tags="5"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      :remote-method="
                        (queryString) => {
                          remoteMethod(
                            queryString,
                            index,
                            item.property,
                            item.filterName
                          );
                        }
                      "
                    >
                      <el-option
                        disabled
                        label=""
                        value=""
                      >
                        <span
                          v-for="(itmx, key) in getAppTitleList(
                            item.property,
                            item['valueList'] ? item['valueList'][0] : undefined
                          )"
                          :key="key"
                          v-show="key != 'id'"
                        >
                          {{ itmx }}
                        </span>
                      </el-option>
                      <el-option
                        v-for="(itm, idx) in item['valueList']"
                        :key="itm.id"
                        :label="itm.value"
                        :value="itm.id"
                      >
                        <el-tooltip
                          v-for="(itmx, key) in item['valueList'][idx]"
                          v-show="key != 'id'"
                          class="item"
                          :key="key"
                          effect="light"
                          :content="itmx"
                          placement="top"
                        >
                          <span>{{ itmx }}</span>
                        </el-tooltip>
                      </el-option>
                    </el-select>
                    <el-autocomplete
                      v-if="item.filterType === 'autocomplete'"
                      v-model="queryModuleData[item.property]"
                      :fetch-suggestions="
                        (queryString, cb) =>
                          querySearchAsync(
                            queryString,
                            index,
                            item.property,
                            item.filterName,
                            cb
                          )
                      "
                      :placeholder="$trans('common.inputPlaceholder')"
                      filterable
                      :popper-append-to-body="false"
                    >
                      <template #default="{ item }">
                        <div
                          class="name_wrap"
                          :class="item.id == -1 ? 'firstName_wrap' : ''"
                        >
                          <el-tooltip
                            class="item"
                            effect="light"
                            :content="item.value"
                            placement="top"
                          >
                            <div :class="item.id == -1 ? 'name0' : 'name'">
                              {{ item.value }}
                            </div>
                          </el-tooltip>
                          <el-tooltip
                            class="item"
                            effect="light"
                            :content="item.value1"
                            placement="top"
                          >
                            <div :class="item.id == -1 ? 'name0' : 'name'">
                              {{ item.value1 }}
                            </div>
                          </el-tooltip>
                          <el-tooltip
                            class="item"
                            effect="light"
                            :content="item.value2"
                            placement="top"
                          >
                            <div :class="item.id == -1 ? 'name0' : 'name'">
                              {{ item.value2 }}
                            </div>
                          </el-tooltip>
                          <el-tooltip
                            class="item"
                            effect="light"
                            :content="item.value3"
                            placement="top"
                          >
                            <div :class="item.id == -1 ? 'name0' : 'name'">
                              {{ item.value3 }}
                            </div>
                          </el-tooltip>
                        </div>
                      </template>
                    </el-autocomplete>
                    <!-- <el-select
                      v-if="item.filterType === 'selectTable'"
                      v-model="queryModuleData[item.property]"
                      filterable
                      clearable
                      :placeholder="$trans('common.selectPlaceholder')"
                    >
                      <el-option
                        v-for="(itm, idx) in item.values"
                        :key="idx"
                        :label="itm.value"
                        :value="itm.id"
                        :disabled="itm.id == -1"
                      >
                        <span
                          v-for="(itmx, key) in item['values'][idx]"
                          :key="key"
                          v-show="key != 'id'"
                          >{{ itmx }}</span
                        >
                      </el-option>
                    </el-select> -->
                    <el-select-v2
                      v-if="item.filterType === 'selectTable'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values.filter(item => item.id != -1) || []"
                      :placeholder="$trans('common.keywordPlaceholder')"
                      reserve-keyword
                      filterable
                      clearable
                      :props="{
                        value: 'id',
                        label: 'value',
                      }"
                    />
                    <div>
                      <el-radio-group
                        v-model="queryModuleData[item.property]"
                        v-if="item.filterType === 'radio'"
                      >
                        <el-radio
                          :value="itm.id"
                          v-for="(itm, index) in item.values"
                          :key="index"
                          >{{ itm.value }}
                        </el-radio>
                      </el-radio-group>
                    </div>
                    <el-input
                      clearable
                      v-model="queryModuleData[item.property]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'text'"
                    ></el-input>
                    <el-input
                      clearable
                      v-model="queryModuleData[item.property]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      type="textarea"
                      v-if="item.filterType === 'textarea'"
                    ></el-input>
                    <div style="display: flex;gap: 10px;"><el-input
                      clearable
                      v-model="queryModuleData[item.property.split(',')[0]]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'textRange'"
                      @change="
                        (string) =>
                          changeTextRange(string, index, item.property)
                      "
                    ></el-input>
                    <span
                      v-if="item.filterType === 'textRange'"
                      v-show="item.property.includes(',')"
                      >至</span
                    >
                    <el-input
                      clearable
                      v-model="queryModuleData[item.property.split(',')[1]]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'textRange'"
                    ></el-input></div>

                    <el-input
                      class="input-range"
                      width="45%"
                      clearable
                      v-model="queryModuleData[item.property.split(',')[0]]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'searchRange'"
                    ></el-input>
                    <span v-if="item.filterType === 'searchRange'">{{
                      $trans("common.to")
                    }}</span>
                    <el-input
                      class="input-range"
                      width="300px"
                      clearable
                      v-model="queryModuleData[item.property.split(',')[1]]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'searchRange'"
                    ></el-input>

                    <el-input
                      clearable
                      v-model="queryModuleData[item.property][0]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'searchCompare'"
                      @change="handleSearchCompare(item.property, 0, false)"
                    ></el-input>
                    <span v-if="item.filterType === 'searchCompare'">{{
                      $trans("common.to")
                    }}</span>
                    <el-input
                      clearable
                      v-model="queryModuleData[item.property][1]"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                      v-if="item.filterType === 'searchCompare'"
                      @change="handleSearchCompare(item.property, 1, false)"
                    ></el-input>
                    <el-date-picker
                      v-if="item.filterType === 'date'"
                      v-model="queryModuleData[item.property]"
                      type="daterange"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      :range-separator="$trans('common.to')"
                      :start-placeholder="$trans('common.start')"
                      :end-placeholder="$trans('common.end')"
                    />
                    <el-date-picker
                      v-if="item.filterType === 'dateSingle'"
                      v-model="queryModuleData[item.property]"
                      type="date"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      :placeholder="
                        $trans('common.inputPlaceholder') + item.filterName
                      "
                    />
                    <el-date-picker
                      v-if="item.filterType === 'dateMonth'"
                      v-model="queryModuleData[item.property]"
                      type="monthrange"
                      format="YYYY-MM"
                      value-format="YYYY-MM"
                      :range-separator="$trans('common.to')"
                      :start-placeholder="$trans('common.start')"
                      :end-placeholder="$trans('common.end')"
                    />
                    <el-cascader
                      v-if="item.filterType === 'cascader'&&item.property=='caseTypeIds'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      collapse-tags
                      :max-collapse-tags="5"
                      :show-all-levels="false"
                      :props="{
                        children: 'childrens',
                        label: 'caseType',
                        value: 'caseTypeId',
                        multiple: true,
                        expandTrigger: 'hover',
                      }"
                      style="width: 100%"
                      clearable
                      filterable
                    />
                    <el-cascader
                      v-if="item.filterType === 'cascader'&&item.property=='conTypeIdList'"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      collapse-tags
                      :max-collapse-tags="5"
                      :show-all-levels="false"
                      :props="{
                        children: 'childrens',
                        label: 'categoryName',
                        value: 'conTypeId',
                        multiple: true,
                        expandTrigger: 'hover',
                      }"
                      style="width: 100%"
                      clearable
                      filterable
                      @change="handleConTypeIdChange"
                    />
                    <el-cascader
                      v-if="item.filterType === 'cascader'&&(item.property=='deptGroupIds'||item.property=='cbGroupIds'||item.property=='caseGroupIds')"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      collapse-tags
                      :max-collapse-tags="5"
                      :show-all-levels="false"
                      style="width: 100%"
                      :props="{
                        children: 'children',
                        label: 'label',
                        value: 'value',
                        multiple: true,
                        expandTrigger: 'hover',
                      }"
                      clearable
                      filterable
                    />
                    <el-cascader
                      v-if="item.filterType === 'cascader'&&(item.property=='sourceIds')"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      collapse-tags
                      :max-collapse-tags="5"
                      :show-all-levels="false"
                      style="width: 100%"
                      :props="{
                        children: 'childrens',
                        label: 'sourceName',
                        value: 'id',
                        multiple: true,
                        expandTrigger: 'hover',
                      }"
                      clearable
                      filterable
                    />
                    <el-cascader
                      v-if="item.filterType === 'cascader'&&(item.property=='deptCode')"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      collapse-tags
                      :max-collapse-tags="5"
                      :show-all-levels="false"
                      style="width: 100%"
                      :props="{
                        children: 'childrens',
                        label: 'orgName',
                        value: 'deptCode',
                        multiple: true,
                        expandTrigger: 'hover',
                      }"
                      clearable
                      filterable
                    />
                    <el-cascader
                      v-if="item.filterType === 'cascader'&&(item.property=='feetIds')"
                      v-model="queryModuleData[item.property]"
                      :options="item.values"
                      collapse-tags
                      :max-collapse-tags="5"
                      :show-all-levels="false"
                      style="width: 100%"
                      :props="{
                        children: 'feeTypes',
                        label: 'feeName',
                        value: 'feetId',
                        multiple: true,
                        expandTrigger: 'hover',
                      }"
                      clearable
                      filterable
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>
            <template #footer>
              <div
                class="clearWrap"
                v-if="drawerState"
              >
                <span
                  @click="queryFilter"
                  class="clickable"
                  style="font-size: 14px;"
                >
                <i class="mdi mdi-cog"></i>
                  &nbsp;&nbsp;{{ $trans("common.filterFieldSetting") }}
                </span>
                <span
                  class="clickable"
                  @click="clearSearch"
                  style="font-size: 14px;"
                  ><i class="mdi mdi-refresh"></i>&nbsp;&nbsp;{{
                    $trans("common.resetFilter")
                  }}</span
                >
                <el-button
                  type="primary"
                  class="search-button"
                  @click="handleSearch(0)"
                  >{{ $trans("common.confirm") }}</el-button
                >
              </div>
            </template>
          </el-dialog>
        </div>
      </div>
    <el-dialog
      v-model="transferVisible"
      :title="$trans('common.filterItems')"
      :width="800"
      :height="520"
    >
      <!-- 弹出框内容 -->
      <div style="display: flex; justify-content: space-between">
        <div class="dialog-left">
          <div>
            {{ $trans("common.optionalField")
            }}<span style="color: #c6c8ca; font-size: 12px"
              >({{ $trans("common.total") }}{{ checkboxOptions.length
              }}{{ $trans("common.number") }})</span
            >
          </div>
          <div class="container">
            <!-- 搜索框 -->
            <el-input
              v-model="diminputleft"
              style="width: 100%"
              :placeholder="$trans('common.defaultPlaceholder')"
            />
            <!-- 全选框 -->
            <div class="checkbox-container">
              <div>
                <div>
                  <el-checkbox
                    v-model="allCheckedLeft"
                    @change="handleAllCheckedChangeLeft"
                    :indeterminate="isIndeterminate"
                    >{{ $trans("common.allSelected") }}
                  </el-checkbox>
                </div>
                <el-checkbox-group
                  style="width: 100%; overflow: auto; height: 320px"
                  v-model="checkedItemsLeft"
                  @change="handleCheckedCitiesChange"
                >
                  <template
                    v-for="(item, index) in checkboxOptions"
                    :key="index"
                  >
                    <el-checkbox
                      v-if="isLeftShow(item.property)"
                      :value="item.property"
                      size="large"
                      >{{ item.filterName }}
                    </el-checkbox>
                  </template>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-right">
          <div>
            {{ $trans("common.selectedFields")
            }}<span style="color: #c6c8ca; font-size: 12px"
              >({{ $trans("common.total") }}{{ checkedItemsLeft.length
              }}{{ $trans("common.number") }})</span
            >
          </div>
          <div class="containerright">
            <!-- 搜索框 -->
            <el-input
              v-model="diminputright"
              style="width: 100%"
              :placeholder="$trans('common.defaultPlaceholder')"
            />
            <div
              style="
                overflow: auto;
                height: 340px;
                margin-top: 10px;
                padding-right: 10px;
                user-select: none; /* 防止拖拽时选中文字 */
              "
            >
              <draggable
                v-model="checkedItemsLeft"
                animation="300"
                chosenClass="chosenClass"
                @change="onMoveCallback"
                forceFallback="true"
                handle=".move"
                item-key="filterId"
              >
                <template #item="{ element }">
                  <div
                    v-if="isRightShow(element)"
                    class="selected-item move"
                    style="
                      height: 28px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      cursor: move;
                      /* margin-top: 3px; */
                      /* margin-bottom: 3px; */
                    "
                  >
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        padding-right: 6px;
                      "
                    >
                      <!-- <img
                        src="@/assets/images/home/drag.png"
                        style="height: 17px; width: 25px"
                        alt="拖拽"
                      /> -->
                      <i class="mdi mdi-drag" style="font-size: 24px;"></i>
                      <span>{{
                        checkboxOptions.find((c) => c.property == element)
                          ?.filterName
                      }}</span>
                    </div>
                    <div style="display: flex; align-items: center">
                      <img
                        v-if="getIndex(element) !== 0"
                        src="@/assets/images/home/toTop.png"
                        style="height: 17px; width: 26px; cursor: pointer"
                        @click="clickToTop(element)"
                        alt="置顶"
                      />
                      <img
                        src="@/assets/images/home/close.png"
                        alt="关闭"
                        style="height: 15px; width: 15px; cursor: pointer"
                        @click="removeItem(element)"
                      />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹出框底部按钮 -->
      <template #footer>
        <div
          class="dialog-footer"
          style="
            display: flex;
            justify-content: space-between;
            pointer-events: auto;
          "
        >
          <div>
            <!-- <el-button @click="resetToDefault">{{
              $trans("common.restoreDefault")
            }}</el-button> -->
          </div>
          <div>
            <el-button @click="cancelColumnSettings">{{
              $trans("common.cancel")
            }}</el-button>
            <el-button
              type="primary"
              @click="saveColumnSettings"
              :loading="saveConfigLoading"
              >{{ $trans("common.save") }}</el-button
            >
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import {
  configFilter,
  queryCustomerNameId,
  queryFilter,
  queryFilterConfig,
  queryList
  // queryApplicantByApplicantNameMh,
} from "@/api/caseList";
import { queryAttendanceGroupPage } from "@/api/attendance";
import { queryAllUrl } from "@/api/applicant";
import { querylyctListUrl,queryCustContactAllUrl,queryCustomerAddrAll,queryCollaborationAll } from "@/api/customerList";
// import { queryAgencyListByName } from '@/api/case'
import { deleteFilterScheme } from "@/api/dashboard";
import { extractTree, unique } from "@/utils";
import LoadingOverlay from "@/components/common/loading";

export default {
  components: {
    Draggable,
    LoadingOverlay
  },
  name: "SearchContent",
  props: {
    isShow: {
      default: false,
    },
    name: {
      type: String,
      default: "",
    },
    bussId: {
      type: Number,
    },
  },
  data() {
    return {
      isDim: 0,
      custList: [],
      childDataList: [],
      addFilterState: false,
      drawerState: false,
      schemeName: "",
      agentNums: "",
      listQuery: {
        pageNo: 1,
        pageSize: 50,
      },
      queryModuleData: {},
      checkboxState: false, // 表头筛选框状态
      transferVisible: false, // 配置筛选条件框
      saveConfigLoading: false, // 配置筛选条件框loading
      checkboxOptions: [], // 全部表头
      checkboxOptionsBack: [], // 全部表头备份数据
      allCheckedLeft: false, // 弹窗左侧是否全选
      diminputleft: "", // 弹窗左侧过滤值
      diminputright: "", // 弹窗右侧过滤值
      checkedItemsLeft: [], // 左侧选中的包头
      transferData: [], // 筛选条件数据
      transferValue: [], // 当前筛选条件id
      caseList: [], // 当前列表数据
      checkCaseList: [], // 当前选中表头条件
      selectColumnList: [], // 配置表头总列数据做循环用
      preferenceList: [], // 循环表头数据
      filterData: {}, // 表头过滤数据
      conditionsModuleList: [], // 渲染筛选条件
      caseListDefault: [], // 案件默认全部列表
      checkFilterList: [], // 控制筛选漏斗状态
      firstRequest: false, //第一次请求
      payTypeList: [],
      isIndeterminate: true, //控制半全选
      isLoaded: false, // 标记数据是否已加载
      filtersLoading:false,
      custConfigList: ['custConId','billCustContactId','custContactId'],
      addrConfigList: ['letterAddrId','billAddrId'], //信函地址，账单地址
    };
  },
  created() {
    this.queryFilterConfig(1);
  },
  watch: {
    isDim() {
      this.$set(this.queryModuleData, "custIdList", []);
      this.$set(this.queryModuleData, "custName", "");
    },
  },
  computed: {
    isEmptyQuery(){
      const obj = { ...this.queryModuleData };
      if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    // 遍历对象的所有键
    for (const key in obj) {
        // 如果键有值，且值不为空数组或非空对象，则返回 false
        const value = obj[key];
        if (value !== null && value !== undefined && value !== '' &&
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === 'object' && Object.keys(value).length === 0)) {
            return false;
        }
    }
    // 如果所有键的值都为空数组、空对象或 undefined，返回 true
    return true;
    }
  },
  methods: {
    loadAttendanceGroupOptions() {
      return queryAttendanceGroupPage(
        {
          pageNo: 1,
          pageSize: 1000,
        },
        {
          isLoading: false,
        }
      )
        .then((res) => {
          const records = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.records)
              ? res.data.records
              : [];
          return records.map((group) => ({
            id: group.groupId,
            value: group.groupName,
          }));
        })
        .catch(() => {
          return [];
        });
    },
    agentNumStartChange(value) {
      if (!this.queryModuleData.agentNumEnd) {
        this.queryModuleData.agentNumEnd = value;
      }
    },
    isShowclose() {
      this.clickClose();
    },
    setQueryModuleData(data) {
      this.queryModuleData = Object.assign(this.queryModuleData, data);
      console.log(data);
      this.handleSearch();
    },
    updateQueryModuleData(data) {
      this.queryModuleData = data;
    },
    getQueryModuleData() {
      return this.queryModuleData;
    },
    querySearchAsync(value, index, property, filterName, cb) {
      cb([]);
    },
    openOrClose() {
      this.drawerState = !this.drawerState;
    },
    clickClose() {
      this.drawerState = false;
    },
    checkBox(e, property, values) {
      if (
        this.queryModuleData[property].includes("") &&
        this.queryModuleData[property].filter((item) => item).length !=
          values.filter((item) => item).length
      ) {
        this.queryModuleData[property] = this.queryModuleData[property].filter(
          (item) => item
        );
      }
      if (e[e.length - 1] == "") {
        this.queryModuleData[property] = values.map((item) => item.id);
      }
    },
    clearSearch() {
      this.$emit("clearSearch");
      for (var key in this.queryModuleData) {
        if (key.includes("Array")) {
          this.queryModuleData[key] = [];
        } else if (
          key === "caseTypeIds" ||
          key === "deptGroupIds" ||
          key === "cbGroupIds"
        ) {
          this.queryModuleData[key] = [];
        } else {
          this.queryModuleData[key] = null;
        }
      }
      console.log(this.queryModuleData,'this.queryModuleData');

      this.$forceUpdate();
    },
    queryFilter() {
      this.transferVisible = true;

      this.queryAllCheckBoxs();
      this.queryPartCheckBoxs();
    },
    //查询已配置筛选项
    queryPartCheckBoxs() {
      const data = {
        bussId: this.bussId,
      };
      queryFilterConfig(data).then((res) => {
        this.checkedItemsLeft = res.data.map((item) => item.property);
      });
    },
    // 查询所有的筛选项
    queryAllCheckBoxs() {
      const data = {
        bussId: this.bussId,
      };
      queryFilter(data).then((res) => {
        this.checkboxOptions = res.data;
        this.checkboxOptionsBack = JSON.parse(JSON.stringify(res.data));
        if (res.success) {
          this.transferData = this.generateData(res.data);
        }
      });
    },
    // 全选/取消全选事件
    handleAllCheckedChangeLeft(checked) {
      if (checked) {
        this.checkedItemsLeft = this.checkboxOptions.map(
          (item) => item.property
        );
      } else {
        this.checkedItemsLeft = [];
      }
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length;
      this.allCheckedLeft = checkedCount === this.checkboxOptions.length;
      console.log(this.allCheckedLeft);
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.checkboxOptions.length;
    },
    //单选可选字段
    isLeftShow(value) {
      return (
        this.checkboxOptionsBack.find((c) => c.property == value) &&
        this.checkboxOptionsBack
          .find((c) => c.property == value)
          .filterName.toLowerCase()
          .includes(this.diminputleft.toLowerCase())
      );
    },
    isRightShow(value) {
      return (
        this.checkboxOptionsBack.find((c) => c.property == value) &&
        this.checkboxOptionsBack
          .find((c) => c.property == value)
          .filterName.toLowerCase()
          .includes(this.diminputright.toLowerCase())
      );
    },
    // 拖动回调函数
    onMoveCallback() {},
    // 右侧拖拽项移除
    removeItem(item) {
      const index = this.checkedItemsLeft.findIndex((i) => i === item);
      if (index > -1) {
        this.checkedItemsLeft.splice(index, 1);
      }
    },
    //置顶
    clickToTop(item) {
      const index = this.checkedItemsLeft.findIndex((el) => el === item); // 获取被点击行的索引
      console.log(index);
      if (index !== -1) {
        this.checkedItemsLeft.splice(index, 1); // 从原位置删除
        this.checkedItemsLeft.unshift(item); // 添加到表格数据的最顶部
      }
    },
    getIndex(item) {
      return this.checkedItemsLeft.findIndex((el) => el === item);
    },
    //恢复默认列
    resetToDefault() {
      deleteFilterScheme({}).then(() => {
        this.queryAllCheckBoxs();
        this.queryPartCheckBoxs();
      });
    },
    // 保存筛选项配置
    saveColumnSettings() {
      this.saveConfigLoading = true
      // 保存设置操作
      this.transferValue = [];
      this.checkedItemsLeft.forEach((item) => {
        this.transferValue.push(
          this.checkboxOptions.find((data) => {
            return item === data.property;
          }).filterId
        );
      });
      const data = {
        bussId: this.bussId,
        filterIds: this.transferValue.join(","),
      };
      configFilter(data).then(() => {
        this.queryFilterConfig();
      });
    },
    // 取消筛选项配置弹窗
    cancelColumnSettings() {
      this.transferVisible = false;
    },
    generateData(arr) {
      arr.forEach((item) => {
        item.key = item.filterId;
        item.label = item.filterName;
      });
      return arr;
    },
    configFilter() {
      const data = {
        bussId: this.bussId,
        filterIds: this.transferValue.join(","),
      };
      configFilter(data).then(() => {
        this.queryFilterConfig();
      });
    },
    defaultQuerySearch() {
      // console.log("this.queryModuleData", this.queryModuleData);
      this.queryModuleData = JSON.parse(localStorage.getItem("queryModuleData"))
        ? JSON.parse(localStorage.getItem("queryModuleData")).find(
            (item) => item.name == this.name
          )
          ? JSON.parse(localStorage.getItem("queryModuleData")).find(
              (item) => item.name == this.name
            ).queryModuleData
          : {}
        : {};
    },
    queryFilterConfig(type) {
      const data = {
        bussId: this.bussId,
      };
      this.conditionsModuleList = [];

      queryFilterConfig(data).then(async (res) => {
        this.transferVisible = false;
        this.saveConfigLoading = false
        this.filtersLoading = false
        this.$nextTick(() => {
          let nextConditionsModuleList = Array.isArray(res.data) ? [...res.data] : [];
          let keyList = nextConditionsModuleList.map((item) => item.property);
          for (var key in this.queryModuleData) {
            if (!keyList.includes(key)) {
              if (key.includes("Date") || ["belongToYearMonth"].includes(key)) {
                this.queryModuleData[key] = ["", ""];
              } else if (key.includes("Array") || key.includes("List")) {
                this.queryModuleData[key] = [];
              } else if (
                key === "caseTypeIds" ||
                key === "deptGroupIds" ||
                key === "cbGroupIds"
              ) {
                this.queryModuleData[key] = [];
              } else {
                this.queryModuleData[key] = null;
              }
            }
          }
          this.defaultQuerySearch();
          if (type == 1) {
            //这里是传出去的筛选数据data
            this.$emit("search", {
              data: this.queryModuleData,
              searchType: undefined,
            });
          }
          const attendanceGroupFilterIndex = nextConditionsModuleList.findIndex(
            (item) =>
              item.filterType === "selectMany" &&
              item.property === "attendanceGroupIdList"
          );
          const applyConditionList = (list) => {
            this.conditionsModuleList = list;
            list.forEach((item) => {
            if (item.filterType.includes("Many")) {
              if (this.queryModuleData[item.property]) {
                if (item.filterType.includes("Many")) {
                  if (item.property == "custIdList"||item.property == "custIdArray") {
                    if (this.queryModuleData[item.property].length) {
                      queryCustomerNameId({
                        custIdArray: this.queryModuleData[item.property],
                      }).then((res) => {
                        this.$set(
                          item,
                          "valueList",
                          res.data.map((i) => ({ id: i.custId, value: i.name }))
                        );
                        this.custList = item.valueList;
                      });
                    }
                  } else {
                    item.valueList = item.values.filter(
                      (i) => i.id == this.queryModuleData[item.property]
                    );
                  }
                }
              } else {
                item.valueList = [];
              }
            }
            if (item.filterType.includes("checkbox")) {
              if (
                this.queryModuleData[item.property] &&
                this.queryModuleData[item.property].length <= 0
              ) {
                this.queryModuleData[item.property] = [];
              }
            }
            });
            this.transferValue = list.map((item) => item.filterId);
          };
          if (attendanceGroupFilterIndex > -1) {
            this.loadAttendanceGroupOptions().then((options) => {
              nextConditionsModuleList[attendanceGroupFilterIndex] = {
                ...nextConditionsModuleList[attendanceGroupFilterIndex],
                values: options,
                valueList: options,
              };
              applyConditionList(nextConditionsModuleList);
            });
            return;
          }
          applyConditionList(nextConditionsModuleList);
        });
      });
    },
    clickoutside() {
      this.drawerState = false;
    },
    handleConTypeIdChange(value) {
      console.log(value);
      // if(value.length){
      //   this.queryModuleData.conTypeId = value[value.length - 1]
      // }else{
      //   this.queryModuleData.conTypeId = null
      // }
    },
    handleSearch() {
      const tagList = [];
      this.conditionsModuleList.forEach((item) => {
        if (
          (Array.isArray(this.queryModuleData[item.property]) &&
            !this.queryModuleData[item.property].length) ||
          this.queryModuleData[item.property] === undefined ||
          this.queryModuleData[item.property] === "" ||
          this.queryModuleData[item.property] === null
        ) {
          delete this.queryModuleData[item.property];
        } else if (
          item.property === "induIdArray" ||
          item.property === "statusList"
        ) {
          this.queryModuleData[item.property].forEach((valueItem) => {
            tagList.push({
              label: item.filterName,
              value: valueItem,
              property: item.property,
              name:
                item.values.filter((fil) => fil.id === valueItem)[0].value ||
                "",
            });
          });
        } else if (item.property === "caseTypeIds") {
          if (this.queryModuleData[item.property].length) {
            const longList = extractTree(item.values, "childrens");
            this.queryModuleData[item.property].forEach((j, jIndex) => {
              tagList.push({
                label: item.filterName,
                value: longList.find((k) => k.caseTypeId == j[j.length - 1])
                  ?.caseType,
                property: item.property,
                index: jIndex,
              });
            });
          }
        } else if (
          Array.isArray(this.queryModuleData[item.property]) &&
          this.queryModuleData[item.property].length
        ) {
          if (item.valueList && item.valueList.length > 0) {
            const valueList = item.valueList;
            let queryValues = this.queryModuleData[item.property];
            let matchedValues = [];
            // 处理多{{ $trans('common.number') }}查询值
            queryValues.forEach((queryValue) => {
              let matchedValue = valueList.find(
                (value) => value.id === queryValue
              );
              if (matchedValue) {
                matchedValues.push(matchedValue.value);
              }
            });
            // 将匹配结果添加到 tagList 中
            tagList.push({
              label: item.filterName,
              value: this.queryModuleData[item.property],
              property: item.property,
              name: matchedValues.length > 0 ? matchedValues.join(", ") : null,
            });
          } else {
            // 处理 conditionsModuleList 中没有找到项、valueList 不存在或为空的情况
            tagList.push({
              label: item.filterName,
              value: this.queryModuleData[item.property],
              property: item.property,
            });
          }
        } else if (item.property === "register") {
          tagList.push({
            label: item.filterName,
            value:
              item.values &&
              item.values.find(
                (p) => p.id == this.queryModuleData[item.property]
              ) &&
              item.values.find(
                (p) => p.id == this.queryModuleData[item.property]
              ).value,
            property: item.property,
            register: item.value,
          });
        } else if (item.property === "agencyId") {
          if (item.valueList && item.valueList.length > 0) {
            let valueList = item.valueList;
            let matchedValue = valueList.find(
              (value) => value.id === this.queryModuleData[item.property]
            );
            tagList.push({
              label: item.filterName,
              value: this.queryModuleData[item.property],
              property: item.property,
              name: matchedValue ? matchedValue.value : null,
            });
          } else {
            // 处理 conditionsModuleList 中没有找到项、valueList 不存在或为空的情况
            tagList.push({
              label: item.filterName,
              value: this.queryModuleData[item.property],
              property: item.property,
            });
          }
        } else if (item.values && item.values.length > 0) {
          const selectedValueObj = item.values.find(
            (value) => value.id === this.queryModuleData[item.property]
          );
          tagList.push({
            label: item.filterName,
            value: this.queryModuleData[item.property],
            property: item.property,
            name: selectedValueObj ? selectedValueObj.value : null,
          });
        } else {
          tagList.push({
            label: item.filterName,
            value: this.queryModuleData[item.property],
            property: item.property,
          });
        }
      });
      this.$emit("search", {
        data: this.queryModuleData,
        searchType: 0,
        tagList,
      });
      console.log({ data: this.queryModuleData, searchType: 0, tagList });
      this.drawerState = false;
    },

    remoteMethod(value, index, property) {
      if (
        value &&
        [
          "appCnName",
          "appCnNameList",
          "applicantCnName",
          "appName",
          "applicantName",
        ].includes(property)
      ) {
        // queryApplicantByApplicantNameMh({ applicantName: value }).then((res) => {
        //   this.custList = unique(
        //     [
        //       ...new Set([
        //         ...res.data.map((item) => ({
        //           value: item.applicantName,
        //           id: item.applicantName,
        //         })),
        //         ...this.custList,
        //       ]),
        //     ],
        //     'id',
        //   )
        //   this.conditionsModuleList[index].valueList = this.custList
        //   // this.$set(
        //   //   this.conditionsModuleList[index],
        //   //   "valueList",
        //   //   this.custList
        //   // );
        //   this.$forceUpdate()
        // })
      }
      if(value && (property === "appCnNameArray")){
        const data = {
          pageNo: 1,
          pageSize: 100,
          orderBy: 1,
          applicantName: value,
        };
        queryAllUrl(data).then((res) => {
          const list = unique(
            [
              ...new Set([
                ...res.data.map((item) => ({
                  id: item.applicantName,
                  value: item.applicantName,
                })),
              ]),
            ],
            "id"
          )
          this.conditionsModuleList[index].valueList = list
        })
      }
      if(value && (property === "appIdList")){
        const data = {
          pageNo: 1,
          pageSize: 100,
          orderBy: 1,
          applicantName: value,
        };
        queryAllUrl(data).then((res) => {
          const list = unique(
            [
              ...new Set([
                ...res.data.map((item) => ({
                  id: item.appId,
                  value: item.applicantName,
                })),
              ]),
            ],
            "id"
          )
          this.conditionsModuleList[index].valueList = list
        })
      }
      if(value && property === "respondentNameCnArray"){
        const data = {
          pageNo: 1,
          pageSize: 100,
          isCustomer: 1,
          fullname: value,
        };
        querylyctListUrl(data).then((res) => {
          const list = unique(
            [
              ...new Set([
                ...res.data.map((item) => ({
                  id: item.conId,
                  value: item.fullname,
                })),
              ]),
            ],
            "id"
          )
          this.conditionsModuleList[index].valueList = list
        })
      }
      if(value && (property === "parentCustIdArray"||property === "custIdList")){
        const data = {
          pageNo: 1,
          pageSize: 100,
          isCustomer: 1,
          keyword: value,
        };
        queryCustomerNameId(data).then((res) => {
          const list = unique(
            [
              ...new Set([
                ...res.data.map((item) => ({
                  id: item.custId,
                  value: item.name,
                })),
              ]),
            ],
            "id"
          )
          this.conditionsModuleList[index].valueList = list
        })
      }
      if (value && property === "custIdArray") {
        const data = {
          pageNo: 1,
          pageSize: 100,
          sign: 1,
          parameter: value,
        };
        queryList(data).then((res) => {
          this.custList = unique(
            [
              ...new Set([
                ...res.data.map((item) => ({
                  id: item.custId,
                  value: item.name,
                })),
              ]),
            ],
            "id"
          );
          this.conditionsModuleList[index].valueList = this.custList;
        })
      }
      if (value && property === "agencyId") {
        console.log(333);
        // queryAgencyListByName({ name: value }).then((res) => {
        //   this.custList = unique(
        //     [
        //       ...new Set([
        //         ...res.data.map((item) => ({
        //           id: item.id,
        //           value: item.name,
        //         })),
        //         ...this.custList,
        //       ]),
        //     ],
        //     'id',
        //   )
        //   this.conditionsModuleList[index].valueList = this.custList
        //   // this.$set(
        //   //   this.conditionsModuleList[index],
        //   //   "valueList",
        //   //   this.custList
        //   // );
        //   this.$forceUpdate()
        // })
      }
      if (value && this.custConfigList.includes(property)) {
        queryCustContactAllUrl({
            name: value,
            pageNo: 1,
            pageSize: 100,
          }).then(res => {
            const list = unique(
              [
                ...new Set([
                  ...res.data.map((item) => ({
                    id: item.custContactId,
                    value: item.name,
                    value1: item.custName,
                  })),
                ]),
              ],
              "id"
            );
            this.conditionsModuleList[index].valueList = list;
          });
      }
      if (value && this.addrConfigList.includes(property)) {
        queryCustomerAddrAll({
            addressCn: value,
            pageNo: 1,
            pageSize: 100,
          }).then(res => {
            const list = unique(
              [
                ...new Set([
                  ...res.data.map((item) => ({
                    id: item.addrId,
                    value: item.addressCn,
                  })),
                ]),
              ],
              "id"
            );
            this.conditionsModuleList[index].valueList = list;
          });
      }
      if (value && ['agencyCustIdArray'].includes(property)) {
        queryCollaborationAll({
            fullname: value,
            pageNo: 1,
            pageSize: 100,
          }).then(res => {
            const list = unique(
              [
                ...new Set([
                  ...res.data.map((item) => ({
                    id: item.custId,
                    value: item.fullname,
                  })),
                ]),
              ],
              "id"
            );
            this.conditionsModuleList[index].valueList = list;
          });
      }
    },
    changeTextRange(value, index, property) {
      this.queryModuleData[property.split(",")[1]] = value;
    },
    getListTitle(property){
      if (this.custConfigList.includes(property)) {
        return ['联系人名称','客户简称']
      }else if(this.addrConfigList.includes(property)){
        return ['地址']
      } else{
        return []
      }
    },
    getAppTitleList(property, valueList0) {
      if (
        [
          "appCnName",
          "appCnNameList",
          "applicantCnName",
          "appName",
          "applicantName",
        ].includes(property)
      ) {
        return {
          id: "-1",
          value: "申请人中文名称",
          value1: "申请人英文名称",
          value2: "申请人中文地址",
          value3: "申请人英文地址",
          // disabled:true
        };
      }
      if (property === "respondentNameCn") {
        return {
          id: "-1",
          value: "被申请人中文名称",
          value1: "被申请人英文名称",
          value2: "被申请人中文地址",
          value3: "被申请人英文地址",
        };
      }
      if (property === "custIdList") {
        return {
          id: "-1",
          value: "简称",
          value1: "国籍",
          value2: "全称",
        };
      }
      return valueList0;
    },
    handleDrawerOpen() {
      if (!this.isLoaded) {
        // 第一次打开时加载数据
        this.queryFilterConfig();
        this.isLoaded = true;
        this.filtersLoading = true
      }
      this.drawerState = !this.drawerState;
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  margin-bottom: 19px;
  box-shadow: 0px 2px 5px 0px rgba(163, 163, 163, 0.35);
}
.container {
  width: 450px;
  height: 410px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.containerright {
  height: 410px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.selected-item:hover {
  background-color: #f7f9fc;
}

.search-input {
  width: 100%;
  height: 30px;
  margin-bottom: 10px;
}

.checkbox-container {
  display: inline-block;
  border-radius: 10px;
}
.queryButton {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  justify-content: center;

  .buttonWrap_small {
    display: flex;
    /*margin: 5px 5px;*/
    align-items: center;

    .el-button {
      margin-left: 10px;
    }
  }
}

.el-form {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  overflow: auto;

  .el-cascader {
    width: 100%;
  }

  .postInfo-container-item {
    :deep(.el-form-item__content) {
      width: 330px;
      display: flex;
      //height: 28px;
      align-items: center;

      .el-select {
        width: 100%;
      }

      .el-input {
        width: 100% !important;
      }

      .el-autocomplete {
        width: 100%;
      }
    }
  }
}

.case_management_item {
  /*min-height: calc(100vh - 50px - 18px - 41px);*/
  display: flex;
  flex-direction: column;
  //overflow: auto;
  padding: 5px 5px;
}

section {
  position: relative;
  clear: both;
  flex: 1;
  //padding-bottom: 200px;
}

.checkbox_bottom {
  position: absolute;
  display: flex;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 29px;
  background: #fff;
  z-index: 2;
  justify-content: flex-end;
}

.checkbox_bottom ~ li:last-of-type {
  margin-bottom: 30px;
}

.el-transfer {
  display: flex;

  :deep(.el-transfer-panel) {
    flex: 1;
  }

  :deep(.el-transfer__buttons) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  //
  //:deep(.el-transfer-panel__list) {
  //  display: flex;
  //  flex-wrap: wrap;
  //
  //  label {
  //    width: 33.3%;
  //    margin-right: 0;
  //  }
  //}

  :deep(.el-transfer-panel__header) {
    display: flex;
    flex-wrap: wrap;
    background-color: white;
    border: none;
    box-sizing: border-box;
    color: var(--el-color-black);
  }

  :deep(.el-transfer-panel__body) {
    border-top: 2px solid var(--el-transfer-border-color);
    border-radius: 5px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

.fullItem {
  width: 85%;
}

.button-group-search {
  position: relative;
  display: flex;

  .searchIcon {
    height: 32px;
    width: 34px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background-color: #556ee6;
    cursor: pointer;
  }
  .searchIcon:hover {
    background-color: #556ee6;
  }
  .emptyFilter{
    background-color: #556ee640;
  }

  .searchWrap {
    border-radius: 5px;
    top: 60px;
    //  right: 0;
    width: 100%;
    min-height: 200px;
    // height: 50px;
    position: absolute;
    border: 1px solid #d4d4d5;
    z-index: 9999;
    overflow: auto;
    padding: 0px 0 50 0px;
    background-color: white;
    box-shadow: 0 3px 6px rgba(111, 111, 111, 0.2);

    :deep(.form-container) {
      overflow: auto;
      max-height: 70vh;
      .el-form-item__label {
        text-align: left;
        font-weight: normal;
        color: #333333;
      }

      .el-form-item__content {
        input {
          border-top: 0;
          border-left: 0;
          border-radius: 0;
          border-right: 0;
        }
      }
    }

    .search-containe {
      padding: 15px 30px 10px 30px;
      display: flex;
      height: 20px;

      .search-name {
        flex: 1;
        font-size: 16px;
        color: #333333;
        // font-weight: bold;
      }
    }
  }
  :deep(.el-dialog__body) {
    height: 510px;
    overflow: auto;
  }
  .clearWrap {
    display: flex;
    justify-content: space-around;
    align-items: center;
    pointer-events: auto;
    .search-button {
      padding: 0px 30px 0px 30px;
      color: #fff;
    }
  }
}
@keyframes show {
  0% {
    opacity: 0;
    //transform: translateX(100%);
  }

  100% {
    // transform: translateX(0);
    opacity: 1;
  }
}

@keyframes hide {
  0% {
    opacity: 1;
    // transform: translateX(0);
  }

  100% {
    opacity: 0;
    //  transform: translateX(100%);
  }
}

:deep(.name_wrap) {
  display: flex;

  .name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-right: 1px solid #2b2f3a;
    border-bottom: 1px solid #2b2f3a;
  }

  .name0 {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    /*text-overflow: ellipsis;*/
    border-right: 1px solid #2b2f3a;
    border-bottom: 1px solid #2b2f3a;
  }
}

:deep(.firstName_wrap) {
  cursor: not-allowed;
  background: #c9c9c9;
}

:deep(.el-button > span) {
  display: inline-flex;
  align-items: flex-end;
  justify-content: space-between;
}


</style>
<style>
.input-range{
  :deep(.el-form-item__content .el-input){
    width: 80px !important;
  }
}
</style>
