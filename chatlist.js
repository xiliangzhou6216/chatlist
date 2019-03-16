(function(global, undefined){
    // 初始化ChatList
    function ChatList(opts){
        if(!(this instanceof ChatList)){
          return new ChatList(opts);
        }
        this.merge(this.opts, opts);
        this.init();
    }

    // ChatList对象原型
    ChatList.prototype = {
        // 对象类型
        opts: {
            appendTo: '',
            generateListItem: null,
            index: 0,
            data: []
        },
        // 对象函数
        // 合并对象
        merge: function(defaultOpts, userOpts){
            if(userOpts){
                Object.assign(defaultOpts, userOpts);
            }
        },
        // 初始化变量
        init: function() {
            let self = this;
            this.parseData();
            // 加载第0页
            this.loadPage(0);
            // 加载中标识
            self.loadTips();
            // 监听window滚动,实现懒加载
            let index = 0;
            window.onscroll= function(){
                //文档内容实际高度（包括超出视窗的溢出部分）
                let scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                //滚动条滚动距离
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                //窗口可视范围高度
                let clientHeight = window.innerHeight || Math.min(document.documentElement.clientHeight,document.body.clientHeight);
                if(clientHeight + scrollTop >= scrollHeight) {
                    // console.log(document.getElementsByClassName('loadTips'));
                    setTimeout(() => {
                        if(index < self.arrpage.length) {
                            self.loadPage(index);
                            self.loadTips();
                            document.getElementsByClassName('loadTips')[index].style.display = "none";
                            index++;
                        }
                        else if(index == self.arrpage.length) {
                            document.getElementsByClassName('loadTips')[index].style.display = "none";
                            self.loadEnd();
                            index++;
                        }
                    }, 2000);
                }
            }
        },
        // 加载第i页
        loadPage: function(item) {
            let list = this.generateList(item);
            let appendTo = this.opts.appendTo || 'body';
            document.querySelector(appendTo).appendChild(list);
        },
        // 解析数据并且按回复时间排序
        parseData: function() {
            let self = this;
            let data = this.opts.data;
            // 新对象接收所有排序号的数组
            data.forEach(v => {
                v.publishTimeNew = v.buildTime;
            })
            data.sort(function(a, b) {
                return b.publishTimeNew> a.publishTimeNew ? 1 : -1;
            }); 
            // 分页,每10个数据为一组页显示
            self.arrpage = this.pagination(data, 10);
            // 现在arrPage为1组10个数据
        },
        // ul列
        generateList: function(item) {
            let self = this;
            let map = self.arrpage;
            let list = document.createElement('ul');
            for(let i in map[item]) {
                list.classList.add('list-ul');
                list.appendChild(self.generateListItem(map[item][i]));
            }
            return list;
        },
        // li列
        generateListItem: function(map){
            if(this.opts.generateListItem && typeof this.opts.generateListItem == 'function'){
                return this.opts.generateListItem(map);
            }
            var tpl = `
            <li class="list-li">
                <div class="li-hd">
                    <div class="li-hd-img">
                        <img src="` + map.avater + `" alt="">
                    </div>
                </div>
                <div class="li-bd">
                    <div class="li-bd-tp">
                        <span class="tp-name"> ` + map.name +  `</span>
                        <span class="tp-time">` + map.buildTime + `</span>
                    </div>
                    <div class="li-bd-content">` + map.content + `</div>
                </div>
            </li>
            `;
            var a = document.createElement('a');
            a.innerHTML = tpl;
            // 聊天接口
            a.href = map.chat;
            return a;
        },
        // 分页
        pagination: function(arr, size) {
            // Break it up.
            let length = arr.length;
            let newArr = [];
            let i = Math.ceil(length/size*1.0);
            let j = 0;
            while(j < i){
                let spare = length - j * size >= size ? size : length - j * size;
                let temp = arr.slice(j * size, j * size + spare);
                newArr.push(temp);
                j++;
            }
            // console.log(newArr);
            return newArr;
        },
        // 加载中提示
        loadTips: function() {
            let div = document.createElement('div');
            div.classList.add('loadTips');
            div.innerHTML = `
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
            <span>加载中</span>
          `;
            let appendTo = this.opts.appendTo || 'body';
            document.querySelector(appendTo).appendChild(div);
        },
        // 加载完毕提示
        loadEnd: function() {
            let div = document.createElement('div');
            div.classList.add('loadEnd');
            div.innerHTML = "没有更多了";
            let appendTo = this.opts.appendTo || 'body';
            document.querySelector(appendTo).appendChild(div);
        },
        // 禁止页面滚动
        preHandler: function(e) {
            e.preventDefault();
        }
    }

    // 定义ChatList
    global.ChatList = ChatList;
})(window);