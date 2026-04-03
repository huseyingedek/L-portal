
$(document).ready(function() {

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $('#barkod_kodu').on('keyup keypress keydown', function(e) {
        if (e.which == 13) {
            $("#form_post").trigger("click");
        }
    });
    
    $('#form_post').on('click', function(e) {
        $.ajax({
            type: "POST",
            url: 'https://online.lizaypirlanta.com/fiyatgor/test.php',
            data: {
                barkod_kodu: $('#barkod_kodu').val(),
            },
            beforeSend: function() {
                $('#wait').css('display', 'block');
            },
            complete: function() {
                $('#wait').css('display', 'none');
            },
            success: function(data) {
                console.log(data)
                var veri = JSON.parse(data);
                var json_uzunlugu = 0;
                $.each(veri, function(i, item) {
                    json_uzunlugu++;
                });
                // return;
                $('.sonuc').removeClass('d-none');
                $('.sonuc_sonuc').removeClass('d-none');
                $('.sonuc_sonuc').css('padding', "2rem");
                $('.sonuc_sonuc').css('background', "#ddd");
                $('.sonuc_sonuc').css('width', "500px");
                $('.sonuc_sonuc').html(' ');
                if (veri.length == 0) {
                    $('.sonuc_sonuc').html(`
                            <div class="alert alert-danger p-3">Bu barkoda ait ürün bulunamadı.</div>
                            `);
                } else {
                    if (json_uzunlugu > 1) {
                        benzer_urunler(veri);
                    } else {
                        if (veri.ROW.SABITFIYAT != '0.0') {
                            ana_tablo(veri.ROW);
                        } else {
                            ana_tablo(veri.ROW)
                        }
                    }
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
    })
})


function ana_tablo(args) {
    var formatter = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    });
    console.log(args);
        $("p").css("font-family", '"Arial Narrow", Arial, sans-serif;');
    if (args.SABITFIYAT == '0.0') { 
        
        $('.sonuc_sonuc').html(`
             <div class="row justify-content-center">
                <div class="col-md-5 mr-2 card justify-content-center mb-3"  style="min-width:450px; padding:0px">
                    <img src="${args.IMGBASE64}" alt="resim" style="border-radius:15px" > 
                </div>
                <div class="col-md-7 card"  style="min-width:450px;  background:#E7E7E7;padding:25px">
                    ${args.DIAMOND == 0 ? '<p class="ml-5 mt-5 text-center">' + args.URUNADI + ' </p>'  : '<p class=" mt-5 texttt" style="text-align:center;">' + args.DIAMOND + " Karat " + args.URUNADI + '</p>' }
                    <h6 class="text-center mb-4" style="text-align:center;">` + formatter.format(args.SONFIYAT).substring(1) + ` ` + args.SPRICECURRENCY + `</h6><hr>
                    <div class="row">
                    <div class="col-md-6"><label>Stok</label></div>
                    <div class="col-md-6">${args.STOKDURUMU == 0 ? '<input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="Stokta Yok">' : ' <input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="'+args.STOKACIKLAMA+'">'}</div>
                </div>
                    <div class="row">
                    <div class="col-md-6"><label>Diamond (Ct)</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.DIAMOND + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Color Clarity</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORCLARITY + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Color Stone</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORSTONE + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Gold K</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.GOLDK + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Ağırlık</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.AGIRLIK+ `"></div>
                </div>
                 
                </div>
            </div>
            `);
        

    } else {
        $('.sonuc_sonuc').html(`
            
      <div class="row justify-content-center">
        <div class="col-md-5 card mr-2 justify-content-center mb-3" style="min-width:450px;  padding:0px">
            <img src="` + args.IMGBASE64 + `" alt="resim" style="border-radius:15px" >
        </div>
        <div class="col-md-7 card"  style="min-width:450px;  background:#E7E7E7;padding:25px">
                ${args.DIAMOND == 0 ? '<p class="ml-5 mt-5 text-center">' + args.URUNADI + ' </p>'  : '<p class=" mt-5 texttt" style="text-align:center;">' + args.DIAMOND + " Karat " + args.URUNADI + '</p>' }             <h6 class="text-center mb-4"><del>` + formatter.format(args.SABITFIYAT).substring(1) + ` ` + args.SPRICECURRENCY + " </del>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + formatter.format(args.SONFIYAT).substring(1) + ` ` + args.SPRICECURRENCY + `</h6><hr>
       
                <div class="row">
                    <div class="col-md-6"><label>Stok</label></div>
                    <div class="col-md-6">${args.STOKDURUMU == 0 ? '<input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="Stokta Yok">' : ' <input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="'+args.STOKACIKLAMA+'">'}</div>
                </div>
                    <div class="row">
                    <div class="col-md-6"><label>Diamond (Ct)</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.DIAMOND + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Color Clarity</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORCLARITY + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Color Stone</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORSTONE + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Gold K</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.GOLDK + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Ağırlık</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.AGIRLIK + `"></div>
                </div>
        </div>
            </div>   
            `);
    }
}

function benzer_urunler(args) {
    var formatter = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    });
    const obj = {};
    $.each(args, function(i, args) {
        obj[i] = {
            BARKOD: args.BARKOD,
            STOKACIKLAMA: args.STOKACIKLAMA,
            STOKDURUMU: args.STOKDURUMU,
            SONFIYAT: args.SONFIYAT,
            SPRICECURRENCY: args.SPRICECURRENCY,
            COLORSTONE: args.COLORSTONE,
            DIAMOND: args.DIAMOND,
            URUNADI: args.URUNADI,
            AGIRLIK: args.AGIRLIK
        };
    });

    $.each(args, function(i, args) {
        if (i == 0) {
            $("p").css("font-family", '"Arial Narrow", Arial, sans-serif;');
            $(".bulundugu_magazalar_row").css("display", 'none');
            if (args.SABITFIYAT == '0.0') {
                $('.sonuc_sonuc').html(`
             <div class="row justify-content-center">
                <div class="col-md-5 mr-2 card justify-content-center mb-3"  style="min-width:450px;  padding:0px">
                    <img src="` + args.IMGBASE64 + `" alt="resim" style="border-radius:15px" > 
                </div>
                  <div class="col-md-7 card"  style="min-width:450px;  background:#E7E7E7;padding:25px">
        ${args.DIAMOND == 0 ? '<p class="ml-5 mt-5 text-center">' + args.URUNADI + ' </p>'  : '<p class=" mt-5 texttt" style="text-align:center;">' + args.DIAMOND + " Karat " + args.URUNADI + '</p>' }
                    <h6 class="text-center mb-4 sonfiyat">` + formatter.format(args.SONFIYAT).substring(1) + ` ` + args.SPRICECURRENCY + `</h6><hr>
                                  <div class="row bulundugu_magazalar_row">
                                <div class="col-md-6">
                                    <label>Bulunduğu Mağazalar</label>
                                </div>
                                <div class="col-md-6">
                                    <select class="form-control form-control-sm bulundugu_magazalar">
                                       
                                </select>
                                </div>
                                
                            </div>
                    <div class="row">
                    <div class="col-md-6"><label>Stok</label></div>
                    <div class="col-md-6 stokdurumu">${args.STOKDURUMU == 0 ? '<input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="Stokta Yok">' : ' <input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="'+args.STOKACIKLAMA+'">'}</div>
                </div>
                    <div class="row">
                    <div class="col-md-6"><label>Diamond (Ct)</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm diamond" disabled style="margin-top:10px;text-align:center;" value="` + args.DIAMOND + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6">Barkod</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm barkodkodu" disabled style="margin-top:10px;text-align:center;" value="` + args.BARKOD + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Color Clarity</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORCLARITY + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Color Stone</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm colorstone" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORSTONE + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Gold K</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.GOLDK + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Ağırlık</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.AGIRLIK+ `"></div>
                </div>
                 
                </div>
            </div>
            `);
               
            } else {
                $('.sonuc_sonuc').html(`
      <div class="row justify-content-center">
        <div class="col-md-5 card mr-2 justify-content-center  mb-3" style="min-width:450px;  padding:0px">
            <img src="` + args.IMGBASE64 + `" alt="resim" style="border-radius:15px" >
        </div>
         <div class="col-md-7 card mr-2"  style="min-width:450px;  background:#E7E7E7;padding:25px">

        ${args.DIAMOND == 0 ? '<p class="ml-5 mt-5 text-center">' + args.URUNADI + ' </p>'  : '<p class=" mt-5  texttt" style="text-align:center;">' + args.DIAMOND + " Karat " + args.URUNADI + '</p>' }
            <h6 class="text-center mb-4 sonfiyat text-center"><del>` + formatter.format(args.SABITFIYAT).substring(1) + ` ` + args.SPRICECURRENCY + " </del>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + formatter.format(args.SONFIYAT).substring(1) + ` ` + args.SPRICECURRENCY + `</h6><hr>
                    <div class="row bulundugu_magazalar_row">
                                <div class="col-md-6">
                                    <label>Bulunduğu Mağazalar</label>
                                </div>
                                <div class="col-md-6">
                                    <select class="form-control form-control-sm bulundugu_magazalar">
                                       
                                </select>
                                </div>
                                
                            </div>
                    <div class="row">
                    <div class="col-md-6"><label>Stok</label></div>
                    <div class="col-md-6 stokdurumu">${args.STOKDURUMU == 0 ? '<input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="Stokta Yok">' : ' <input type="text" class="form-control form-control-sm" disabled style="text-align:center;" value="'+args.STOKACIKLAMA+'">'}</div>
                </div>
                    <div class="row">
                    <div class="col-md-6"><label>Diamond (Ct)</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm diamond" disabled style="margin-top:10px;text-align:center;" value="` + args.DIAMOND + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6">Barkod</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm barkodkodu" disabled style="margin-top:10px;text-align:center;" value="` + args.BARKOD + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Color Clarity</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm colorclarity" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORCLARITY + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Color Stone</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm colorstone" disabled style="margin-top:10px;text-align:center;" value="` + args.COLORSTONE + `"></div>
                </div> 
                <div class="row">
                    <div class="col-md-6"><label>Gold K</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.GOLDK + `"></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><label>Ağırlık</label></div>
                    <div class="col-md-6"><input type="text" class="form-control form-control-sm" disabled style="text-align:center;margin-top:10px;" value="` + args.AGIRLIK + `"></div>
                </div>
                 
        </div>
            </div>
   
            `); 
            }
            for (const key in obj) {
                $(".bulundugu_magazalar").append("<option value='" + obj[key].BARKOD + "'>" + obj[key].STOKACIKLAMA + "</option>")
            }
            $(".bulundugu_magazalar").on('change', function() {
                for (const key in obj) {
                    if (obj[key].BARKOD == $(this).val()) {
                        $('.diamond').val(obj[key].DIAMOND);
                        $('.diamondproductname').html(obj[key].DIAMOND + " Karat " + obj[key].URUNADI);
                        $('.sonfiyat').html(formatter.format(obj[key].SONFIYAT).substring(1) + " " + obj[key].SPRICECURRENCY);
                        $('.stokdurumu').html(obj[key].STOKDURUMU == 0 ? '<input type="text" class="form-control form-control-sm text-center mt-1 mb-1" disabled value="Stokta Yok" />' : '<input type="text" class="form-control form-control-sm text-center mt-1 mb-1" disabled value="Stokta Var" />');
                        $('.colorstone').val(obj[key].COLORSTONE);
                        $('.barkodkodu').val(obj[key].BARKOD);
                        $('.colorclarity').val(obj[key].COLORCLARITY);

                    }
                }
            })
        }
    });
}