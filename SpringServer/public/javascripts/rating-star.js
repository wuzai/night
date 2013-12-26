
$(function(){
  var flag = 1;
  var text = $('#rating-star .s_result').text();

  $('#rating-star .star_ul a').hover(function(){
    flag = 1;
    $('#rating-star .star_ul a').removeClass('active-star');
    $(this).addClass('active-star');
    $('#rating-star .s_result').css('color','#c00').html($(this).attr('title'));
  },function(){
    if( flag == 1){
      $(this).removeClass('active-star');
      $('#rating-star .s_result').css('color','#333').html(text);
      var v = $('#rating-star input.star-value').val();
      $("#rating-star .star_ul a[value='"+v+"']").click();
    }
  });

  $('#rating-star .star_ul a').click(function(){
    flag = 2;
    $(this).addClass('active-star');
    $('#rating-star .s_result').css('color','#c00').html($(this).attr('title'));
    $('#rating-star input.star-value').val($(this).attr('value'));
  });

  $('#rating-star .square_ul a').hover(function(){
    flag = 3;
    $('#rating-star .square_ul a').removeClass('active-square');
    $(this).addClass('active-square');
    $(this).parents('.starbox').find('.s_result_square').css('color','#c00').html($(this).attr('title'))
  },function(){
    if(flag == 3){
      $(this).removeClass('active-square');
      $(this).parents('.starbox').find('.s_result_square').css('color','#333').html(text)
    }
  });

  $('#rating-star .square_ul a').click(function(){
    flag = 4;
    $(this).addClass('active-square');
    $(this).parents('.starbox').find('.s_result_square').css('color','#c00').html($(this).attr('title'))	});
})