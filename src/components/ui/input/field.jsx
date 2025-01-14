import { Input } from "@nextui-org/input";
import React, { FC, forwardRef, useEffect } from "react";
import { EyeSlashFilledIcon } from "./inputIcon/EyeSlashFilledIcon";
import { EyeFilledIcon } from "./inputIcon/EyeFilledIcon";
import { IField } from "./field.interface";
import cn from 'clsx'



const Field = ((
  { 
  type, 
  className,
  error,
  placeholder,
  style,
  isClear,
  ...rest
  }, ref
)  => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);


  useEffect(() => {
    if (type == 'email') {
      setIsVisible(true)
    }
  }, [type])


  return (
    <div className={cn('dark:text-white', className)} style={style}>
      <Input
        label={placeholder}
        isClearable={isClear}
        isRequired
        isInvalid={Boolean(error)}
        ref={ref}
        variant="bordered"
        errorMessage={error}
        type={isVisible ? "email" : "password"} 
        // type={type}
        className="max-w-xs"
        endContent={
          type === "password" ? (
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
              aria-label="toggle password visibility"
            >
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          ) : null }
        {...rest}
      />

    </div>
  );
}
)

export default Field;
