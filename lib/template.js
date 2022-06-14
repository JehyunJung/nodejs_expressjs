const template={
    html:function(title,list,body,control){
        const html=`
        <!doctype html>
            <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">WEB</a></h1>
                    <a href="/author">author</a>
                    ${list}
                    ${control}
                    ${body}
                </body>
            </html>
        `;
        return html;
    },
    topic_list:function(topics){
        let list='<ul>';
        topics.forEach(topic=>{
            list+=`<li><a href="/topic/${topic.id}">${topic.title}</a></li>`
            })
        list+="</ul>";
    
        return list;
    },
    author_list:function(authors){
        let table_tag="";
        let table_body=""

        authors.forEach((author)=>{
            table_body+=`
            <tr>
                <td>${author.name}</td>
                <td>${author.profile}</td>
                <td><a href="/author/update/${author.id}">update</a></td>
                <td>
                <form action="/author/delete_process" method="post">
                    <input name="id"  value="${author.id}" hidden></input>
                    <input type="submit" value="delete"></input>
                </form>
                </td>
            </tr>
                `
        })
        if(authors.length >1){
            table_tag=`
            <table border=1>
                <th>author</th>
                <th>profile</th>
                <th>update</th>
                <th>delete</th>
                ${table_body}
            </table>
                `;
        }
        return table_tag;
    },

    author_select:function(authors,current_id){
        let option_tag="";
    
        authors.forEach((author)=>{
          let selected="";
          if(author.id===current_id){
            selected="selected";
          }
            option_tag+=`<option value=${author.id} ${selected}>${author.name}</option>`;
        });
        
        return `<p>
        <select name="author">
        ${option_tag}
        </select>
         </p>
        `;
      }

}

module.exports=template;