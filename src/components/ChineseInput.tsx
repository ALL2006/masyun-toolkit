import React, { useState, useRef } from 'react';
import { Input, InputProps } from 'antd';

/**
 * 支持中文输入法的 Input 组件
 * 解决中文输入过程中内容被清除的问题
 *
 * 关键问题：Android WebView 中，使用中文输入法时：
 * 1. compositionstart 开始
 * 2. 用户输入拼音（onChange 触发，但值是拼音）
 * 3. 用户选择汉字
 * 4. compositionend 结束
 * 5. 如果此时 blur 已触发，Form 可能会用旧值或空值验证
 *
 * 解决方案：
 * 1. 不阻止 onChange，让 Form 实时更新
 * 2. blur 时检查是否在 composition 中，如果是则延迟
 * 3. 确保 compositionend 一定在 blur 之前完成
 */
const ChineseInput: React.FC<InputProps> = (props) => {
  const [composing, setComposing] = useState(false);
  const compositionEndPromise = useRef<Promise<void> | null>(null);
  const resolveCompositionEnd = useRef<(() => void) | null>(null);

  const handleCompositionStart: InputProps['onCompositionStart'] = (e) => {
    // console.log('composition start');
    setComposing(true);

    // 创建一个 Promise，等待 composition 结束
    compositionEndPromise.current = new Promise((resolve) => {
      resolveCompositionEnd.current = resolve;
    });

    props.onCompositionStart?.(e);
  };

  const handleCompositionEnd: InputProps['onCompositionEnd'] = (e) => {
    // console.log('composition end, value:', e.currentTarget.value);
    setComposing(false);

    // 解析 Promise
    if (resolveCompositionEnd.current) {
      resolveCompositionEnd.current();
      resolveCompositionEnd.current = null;
    }
    compositionEndPromise.current = null;

    // 确保值传递到 Form
    props.onChange?.(e as any);
    props.onCompositionEnd?.(e);
  };

  const handleChange: InputProps['onChange'] = (e) => {
    // 正常传递 onChange，不阻止
    // Form 需要实时更新值
    props.onChange?.(e);
  };

  const handleBlur: InputProps['onBlur'] = async (e) => {
    // console.log('blur, composing:', composing);

    if (composing) {
      // 等待 composition 结束
      if (compositionEndPromise.current) {
        await compositionEndPromise.current;
      }

      // composition 结束后，获取最新的值
      const inputValue = e.target.value;

      // 确保 Form 有最新的值
      props.onChange?.({
        target: { value: inputValue },
        currentTarget: { value: inputValue }
      } as any);

      // 稍微延迟再触发 onBlur
      setTimeout(() => {
        props.onBlur?.(e);
      }, 50);
    } else {
      // 正常 blur
      props.onBlur?.(e);
    }
  };

  const setRef = (ref: any) => {
    const propsRef = (props as any).ref;
    if (typeof propsRef === 'function') {
      propsRef(ref);
    } else if (propsRef) {
      propsRef.current = ref;
    }
  };

  return (
    <Input
      {...props}
      ref={setRef}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default ChineseInput;
