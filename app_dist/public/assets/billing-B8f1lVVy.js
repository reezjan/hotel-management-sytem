import{q as Z,u as ee,b as te,r as N,l as T,d as O,j as e,C as se,m as ae,n as ne,a as re,p as u,B as $,k}from"./index-Dk6nXF67.js";import{D as ie,Y as oe,v as de,b as le,w as ce}from"./dashboard-layout-BUO8e75G.js";import{S as R,a as D,b as K,c as _,d as A}from"./select-Gj2YppMn.js";import{R as ue,h as pe}from"./users-Dxbor6Q1.js";import"./circle-alert-BbQxKC8I.js";import"./index-CC2mel_A.js";import"./index-D-DdYU4C.js";function je(){const{user:I}=Z(),{toast:p}=ee(),C=te(),[v,q]=N.useState(""),[m,M]=N.useState(""),[S,P]=N.useState(""),[n,j]=N.useState(null),{data:h}=T({queryKey:["/api/hotels/current"]}),{data:V=[]}=T({queryKey:["/api/hotels/current/restaurant-tables"],refetchInterval:5e3,refetchIntervalInBackground:!0}),{data:Q=[]}=T({queryKey:["/api/hotels/current/kot-orders"],refetchInterval:3e3,refetchIntervalInBackground:!0}),{data:B=[]}=T({queryKey:["/api/hotels/current/menu-items"]}),{data:U=[]}=T({queryKey:["/api/hotels/current/taxes"]}),E=O({mutationFn:async t=>{await k("POST","/api/transactions",t)},onSuccess:()=>{C.invalidateQueries({queryKey:["/api/hotels/current/transactions"]}),p({title:"Payment processed successfully"})}}),L=O({mutationFn:async({orderId:t,status:s})=>{await k("PUT",`/api/kot-orders/${t}`,{status:s})},onSuccess:()=>{C.invalidateQueries({queryKey:["/api/hotels/current/kot-orders"]})}}),[W,F]=N.useState(!1),G=async()=>{if(!S.trim()){p({title:"Please enter a voucher code",variant:"destructive"});return}F(!0);try{const s=await(await fetch("/api/vouchers/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:S.trim()}),credentials:"include"})).json();s.valid&&s.voucher?(j(s.voucher),p({title:"Voucher applied successfully!"})):(j(null),p({title:"Invalid voucher",description:s.message||"Voucher code is invalid",variant:"destructive"}))}catch{j(null),p({title:"Error validating voucher",variant:"destructive"})}finally{F(!1)}},H=O({mutationFn:async t=>{await k("POST","/api/vouchers/redeem",{voucherId:t})}}),g=Q.filter(t=>{var s;return t.tableId!==v||t.status==="cancelled"||t.status==="served"?!1:(s=t.items)==null?void 0:s.some(r=>r.status==="approved"||r.status==="ready")}),l=(()=>{let t=0;g.forEach(a=>{var i;(i=a.items)==null||i.forEach(o=>{if(o.status==="approved"||o.status==="ready"){const y=B.find(X=>X.id===o.menuItemId);y&&(t+=y.price*o.qty)}})});const s=U.filter(a=>a.isActive),r=["vat","service_tax","luxury_tax"],w=s.sort((a,i)=>{const o=r.indexOf(a.taxType),y=r.indexOf(i.taxType);return(o===-1?999:o)-(y===-1?999:y)});let c=t;const d={};w.forEach(a=>{const i=parseFloat(a.percent)/100,o=Math.round(c*i*100)/100,y=a.taxType==="vat"?"VAT":a.taxType==="service_tax"?"Service Tax":a.taxType==="luxury_tax"?"Luxury Tax":a.taxType;d[y]={rate:parseFloat(a.percent),amount:o},c=Math.round((c+o)*100)/100});const b=Object.values(d).reduce((a,i)=>a+i.amount,0);let f=Math.round((t+b)*100)/100,x=0;return n&&(n.discountType==="percentage"?x=Math.round(f*(parseFloat(n.discountAmount)/100)*100)/100:n.discountType==="fixed"&&(x=Math.min(parseFloat(n.discountAmount),f)),f=Math.round((f-x)*100)/100),{subtotal:t,taxBreakdown:d,totalTax:b,discountAmount:x,grandTotal:f}})(),Y=async()=>{var t;if(!m){p({title:"Error",description:"Please select a payment method",variant:"destructive"});return}if(g.length===0){p({title:"Error",description:"No orders to process",variant:"destructive"});return}try{n&&await H.mutateAsync(n.id),await E.mutateAsync({txnType:m==="cash"?"cash_in":m==="pos"?"pos_in":"fonepay_in",amount:l.grandTotal.toFixed(2),paymentMethod:m,purpose:"restaurant_sale",reference:`Table: ${((t=V.find(s=>s.id===v))==null?void 0:t.name)||v}${n?` | Voucher: ${n.code}`:""}`});for(const s of g)await L.mutateAsync({orderId:s.id,status:"served"});await k("PUT",`/api/hotels/current/restaurant-tables/${v}`,{status:"available"}),await C.invalidateQueries({queryKey:["/api/hotels/current/kot-orders"]}),await C.invalidateQueries({queryKey:["/api/hotels/current/restaurant-tables"]}),z(),p({title:"Payment processed successfully"}),q(""),M(""),P(""),j(null)}catch{p({title:"Error",description:"Failed to process payment",variant:"destructive"})}},J=()=>{j(null),P(""),p({title:"Voucher removed"})},z=()=>{var f;const t=(h==null?void 0:h.name)||"HOTEL",s=(h==null?void 0:h.address)||"",r=(h==null?void 0:h.phone)||"",w=((f=V.find(x=>x.id===v))==null?void 0:f.name)||"Unknown",c=new Date;let d=`
<div style="font-family: 'Courier New', monospace; width: 300px; padding: 10px;">
  <div style="text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
    ${t}
  </div>
  
  <div style="text-align: center; font-size: 11px; margin-bottom: 10px;">
    ${s?`${s}<br/>`:""}
    ${r?`Tel: ${r}<br/>`:""}
  </div>
  
  <div style="text-align: center; font-size: 12px; margin-bottom: 15px;">
    Restaurant Bill<br/>
    ${w}
  </div>
  
  <div style="font-size: 11px; margin-bottom: 10px;">
    <div>Date: ${c.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"2-digit"})}</div>
    <div>Time: ${c.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
    <div>Bill No: ${c.getTime().toString().slice(-8)}</div>
    <div>Waiter: ${I==null?void 0:I.username}</div>
  </div>
  
  <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin: 10px 0;">
    <table style="width: 100%; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="text-align: left; padding-bottom: 5px;">Item</th>
          <th style="text-align: center; padding-bottom: 5px;">Qty</th>
          <th style="text-align: right; padding-bottom: 5px;">Amount</th>
        </tr>
      </thead>
      <tbody>
`;g.forEach(x=>{var a;(a=x.items)==null||a.forEach(i=>{if(i.status==="approved"||i.status==="ready"){const o=B.find(y=>y.id===i.menuItemId);o&&(d+=`
        <tr>
          <td style="padding: 3px 0;">${o.name}</td>
          <td style="text-align: center;">${i.qty}</td>
          <td style="text-align: right;">${u(o.price*i.qty)}</td>
        </tr>`)}})}),d+=`
      </tbody>
    </table>
  </div>
  
  <div style="font-size: 11px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>Subtotal:</span>
      <span>${u(l.subtotal)}</span>
    </div>
`,Object.entries(l.taxBreakdown).forEach(([x,a])=>{d+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
      <span>${x} (${a.rate}%):</span>
      <span>${u(a.amount)}</span>
    </div>`}),l.discountAmount>0&&n&&(d+=`
    <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #16a34a;">
      <span>Discount (${n.code}):</span>
      <span>-${u(l.discountAmount)}</span>
    </div>`),d+=`
    <div style="display: flex; justify-content: space-between; padding: 10px 0 5px 0; margin-top: 5px; border-top: 2px dashed #000; font-weight: bold; font-size: 14px;">
      <span>GRAND TOTAL:</span>
      <span>${u(l.grandTotal)}</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold;">
      <span>Payment Method:</span>
      <span>${m.toUpperCase()}</span>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 12px;">
    Thank You! Visit Again<br/>
    <div style="margin-top: 5px; font-size: 10px;">
      This is a computer generated bill
    </div>
  </div>
</div>
    `;const b=window.open("","_blank","width=400,height=600");b&&(b.document.write(`
        <html>
          <head>
            <title>Bill - ${t}</title>
            <style>
              @media print {
                body { margin: 0; }
              }
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Courier New', monospace;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${d}
          </body>
        </html>
      `),b.document.close())};return e.jsx(ie,{title:"Billing",children:e.jsx("div",{className:"space-y-6",children:e.jsxs(se,{children:[e.jsx(ae,{children:e.jsxs(ne,{className:"flex items-center",children:[e.jsx(ue,{className:"h-5 w-5 mr-2"}),"Generate Bill"]})}),e.jsxs(re,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-sm font-medium text-foreground mb-2 block",children:"Select Table"}),e.jsxs(R,{value:v,onValueChange:q,children:[e.jsx(D,{className:"w-full",children:e.jsx(K,{placeholder:"Choose a table"})}),e.jsx(_,{children:V.map(t=>e.jsx(A,{value:t.id,children:t.name},t.id))})]})]}),v&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("h3",{className:"font-semibold text-lg",children:"Order Items (Approved/Ready)"}),g.length===0?e.jsx("p",{className:"text-muted-foreground text-sm",children:"No approved orders for this table"}):e.jsx("div",{className:"space-y-2",children:g.map(t=>{var s;return e.jsx("div",{className:"text-sm",children:(s=t.items)==null?void 0:s.map((r,w)=>{if(r.status==="approved"||r.status==="ready"){const c=B.find(d=>d.id===r.menuItemId);return c?e.jsxs("div",{className:"flex justify-between py-1",children:[e.jsxs("span",{children:[c.name," x ",r.qty]}),e.jsx("span",{children:u(c.price*r.qty)})]},w):null}return null})},t.id)})})]}),g.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"border rounded-lg p-4 space-y-2",children:[e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Subtotal:"}),e.jsx("span",{children:u(l.subtotal)})]}),Object.entries(l.taxBreakdown).map(([t,s])=>e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsxs("span",{children:[t," (",s.rate,"%):"]}),e.jsx("span",{children:u(s.amount)})]},t)),l.discountAmount>0&&n&&e.jsxs("div",{className:"flex justify-between text-sm text-green-600",children:[e.jsxs("span",{children:["Discount (",n.code,"):"]}),e.jsxs("span",{children:["-",u(l.discountAmount)]})]}),e.jsxs("div",{className:"flex justify-between text-lg font-bold pt-2 border-t",children:[e.jsx("span",{children:"Total:"}),e.jsx("span",{children:u(l.grandTotal)})]})]}),e.jsxs("div",{className:"border rounded-lg p-4 space-y-3",children:[e.jsx("label",{className:"text-sm font-medium text-foreground",children:"Discount Voucher (Optional)"}),n?e.jsxs("div",{className:"flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(pe,{className:"h-5 w-5 text-green-600"}),e.jsxs("div",{children:[e.jsxs("p",{className:"text-sm font-medium text-green-900 dark:text-green-100",children:["Voucher Applied: ",n.code]}),e.jsx("p",{className:"text-xs text-green-700 dark:text-green-300",children:n.discountType==="percentage"?`${n.discountAmount}% discount`:`${u(parseFloat(n.discountAmount))} off`})]})]}),e.jsx($,{variant:"outline",size:"sm",onClick:J,"data-testid":"button-remove-voucher",children:"Remove"})]}):e.jsxs("div",{className:"flex gap-2",children:[e.jsx("input",{type:"text",placeholder:"Enter voucher code",value:S,onChange:t=>P(t.target.value.toUpperCase()),className:"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50","data-testid":"input-voucher-code"}),e.jsx($,{onClick:G,disabled:!S.trim()||W,"data-testid":"button-apply-voucher",children:"Apply"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm font-medium text-foreground mb-2 block",children:"Payment Method"}),e.jsxs(R,{value:m,onValueChange:M,children:[e.jsx(D,{className:"w-full",children:e.jsx(K,{placeholder:"Choose payment method"})}),e.jsxs(_,{children:[e.jsx(A,{value:"cash",children:"Cash"}),e.jsx(A,{value:"pos",children:"POS"}),e.jsx(A,{value:"fonepay",children:"Fonepay"})]})]})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsxs($,{className:"flex-1",onClick:z,variant:"outline",children:[e.jsx(oe,{className:"h-4 w-4 mr-2"}),"Print Bill"]}),e.jsxs($,{className:"flex-1",onClick:Y,disabled:!m||E.isPending,children:[m==="cash"&&e.jsx(de,{className:"h-4 w-4 mr-2"}),m==="pos"&&e.jsx(le,{className:"h-4 w-4 mr-2"}),m==="fonepay"&&e.jsx(ce,{className:"h-4 w-4 mr-2"}),"Process Payment"]})]})]})]})]})]})})})}export{je as default};
